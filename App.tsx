import React, { useState, useEffect, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import Header from './components/Header'
import Homepage from './components/Homepage'
import Dashboard from './components/Dashboard'
import ServerSelectorPage from './components/ServerSelectorPage'
import { DiscordGuild } from './types'
import { SpinnerIcon } from './components/icons/Icons'

const getHashRoute = () => window.location.hash.substring(1) || '/'

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [selectedServer, setSelectedServer] = useState<DiscordGuild | null>(null)
  const [route, setRoute] = useState(getHashRoute())
  const [loading, setLoading] = useState(true)

  // --- Routing logic
  const navigate = useCallback((path: string) => {
    window.location.hash = path
  }, [])

  useEffect(() => {
    const handleHashChange = () => setRoute(getHashRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // --- Dynamic page titles
  useEffect(() => {
    document.title = route.startsWith('/dashboard')
      ? 'Flamey | Dashboard'
      : 'Flamey Discord Bot'
  }, [route])

  // --- Session management
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setSelectedServer(null)
        localStorage.removeItem('lastSelectedServer')
        sessionStorage.clear()
        if (getHashRoute() !== '/') navigate('/')
      }
    })

    return () => subscription?.unsubscribe()
  }, [navigate])

  // --- Restore last server when returning to dashboard
  useEffect(() => {
    if (session && route.startsWith('/dashboard') && !selectedServer) {
      const last = localStorage.getItem('lastSelectedServer')
      if (last) {
        try {
          setSelectedServer(JSON.parse(last))
        } catch {
          localStorage.removeItem('lastSelectedServer')
          navigate('/select-server')
        }
      } else {
        navigate('/select-server')
      }
    }
  }, [session, route, selectedServer, navigate])

  // --- Login with Discord
  const handleLogin = async () => {
    const redirectURL = `${window.location.origin}/callback.html`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'identify email guilds guilds.members.read',
        queryParams: {
          prompt: 'consent',
          access_type: 'offline',
        },
        redirectTo: redirectURL,
      },
    })
    if (error) console.error('Login error:', error.message)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Logout error:', error.message)
  }

  const handleDashboardClick = () => {
    const last = localStorage.getItem('lastSelectedServer')
    if (last) {
      try {
        const server = JSON.parse(last) as DiscordGuild
        setSelectedServer(server)
        navigate('/dashboard')
      } catch {
        localStorage.removeItem('lastSelectedServer')
        navigate('/select-server')
      }
    } else navigate('/select-server')
  }

  const handleServerSelected = (server: DiscordGuild) => {
    setSelectedServer(server)
    localStorage.setItem('lastSelectedServer', JSON.stringify(server))
    navigate('/dashboard')
  }

  const handleGoToServerSelector = () => {
    setSelectedServer(null)
    localStorage.removeItem('lastSelectedServer')
    navigate('/select-server')
  }

  // --- Loading state
  if (loading) {
    return (
      <div className="bg-transparent w-full h-full flex items-center justify-center">
        <SpinnerIcon className="h-8 w-8 text-nexus-accent-end" />
      </div>
    )
  }

  // --- Authenticated routing
  if (session) {
    if (route.startsWith('/dashboard')) {
      if (selectedServer) {
        return (
          <Dashboard
            key={selectedServer.id}
            session={session}
            onLogout={handleLogout}
            server={selectedServer}
            onGoToServerSelector={handleGoToServerSelector}
            onServerSelected={handleServerSelected}
            onLogin={handleLogin}
          />
        )
      }
      return (
        <div className="bg-transparent w-full h-full flex items-center justify-center">
          <SpinnerIcon className="h-8 w-8 text-nexus-accent-end" />
        </div>
      )
    }

    if (route === '/select-server') {
      return (
        <ServerSelectorPage
          session={session}
          onServerSelected={handleServerSelected}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )
    }
  }

  // --- Public homepage
  return (
    <div className="bg-transparent text-nexus-primary-text min-h-screen">
      <Header
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onDashboardClick={handleDashboardClick}
      />
      <main>
        <Homepage onLogin={handleLogin} />
      </main>
    </div>
  )
}

export default App
