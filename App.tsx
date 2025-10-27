import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Dashboard from './components/Dashboard';
import ServerSelectorPage from './components/ServerSelectorPage';
import { DiscordGuild } from './types';
import { SpinnerIcon } from './components/icons/Icons';

const getHashRoute = () => window.location.hash.substring(1) || '/';

const getInitialServer = (): DiscordGuild | null => {
  const serverJson = localStorage.getItem('lastSelectedServer');
  if (!serverJson) return null;
  try {
    return JSON.parse(serverJson) as DiscordGuild;
  } catch (e) {
    console.error("Failed to parse server from localStorage", e);
    localStorage.removeItem('lastSelectedServer');
    return null;
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedServer, setSelectedServer] = useState<DiscordGuild | null>(getInitialServer());
  const [route, setRoute] = useState(getHashRoute());
  const [loading, setLoading] = useState(true);

  // --- Router/Navigation Logic ---
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- Update Document Title ---
  useEffect(() => {
    const title = route.startsWith('/dashboard')
      ? 'Flamey | Dashboard'
      : 'Flamey Discord Bot';
    document.title = title;
  }, [route]);

  // --- Session Management ---
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (_event === 'SIGNED_IN') {
        // On successful login, always redirect to the server selection page.
        navigate('/select-server');
      }

      if (!session) {
        setSelectedServer(null);
        localStorage.removeItem('lastSelectedServer');
        // Clear all session storage on logout to prevent any stale cache
        sessionStorage.clear();
        if (getHashRoute() !== '/') navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // --- Store Discord Tokens When Session is Available ---
  useEffect(() => {
    const storeDiscordTokens = async (session: Session) => {
      if (session?.provider_token) {
        console.log('🔄 Storing Discord tokens for user:', session.user.id);
        
        try {
          const { error } = await supabase
            .from('user_discord_tokens')
            .upsert({
              id: session.user.id,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token,
              expires_at: new Date(Date.now() + (session.expires_in * 1000)).toISOString(),
            });

          if (error) {
            console.error('❌ Failed to store tokens:', error);
          } else {
            console.log('✅ Tokens stored successfully!');
          }
        } catch (err) {
          console.error('❌ Error storing tokens:', err);
        }
      }
    };

    if (session) {
      storeDiscordTokens(session);
    }
  }, [session]);

  // --- Navigation & State Sync Logic ---
  useEffect(() => {
    if (session && !selectedServer && route.startsWith('/dashboard')) {
      // If user is logged in, trying to access dashboard, but no server is selected (e.g. from localStorage)
      // then redirect them to select one.
      navigate('/select-server');
    }
  }, [session, selectedServer, route, navigate]);


  // --- LOGIN HANDLER ---
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'guilds identify email guilds.members.read',
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
  };

  // --- DASHBOARD NAVIGATION ---
  const handleDashboardClick = () => {
    // Relies on selectedServer state which is now initialized from localStorage
    if (selectedServer) {
        navigate('/dashboard');
    } else {
        navigate('/select-server');
    }
  };

  const handleServerSelected = (server: DiscordGuild) => {
    setSelectedServer(server);
    localStorage.setItem('lastSelectedServer', JSON.stringify(server));
    navigate('/dashboard');
  };

  const handleGoToServerSelector = () => {
    navigate('/select-server');
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-transparent w-full h-full flex items-center justify-center">
        <SpinnerIcon className="h-8 w-8 text-nexus-accent-end" />
      </div>
    );
  }

  // --- AUTH ROUTING ---
  if (session) {
    if (route === '/select-server') {
      return (
        <ServerSelectorPage
          session={session}
          onServerSelected={handleServerSelected}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      );
    }

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
        );
      }
      
      // If no server is selected, the useEffect above will navigate away.
      // Show a loader in the meantime.
      return (
        <div className="bg-transparent w-full h-full flex items-center justify-center">
          <SpinnerIcon className="h-8 w-8 text-nexus-accent-end" />
        </div>
      );
    }
  }

  // --- PUBLIC HOMEPAGE ---
  return (
    <div className="bg-transparent text-nexus-primary-text min-h-screen">
      <Header
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onDashboardClick={handleDashboardClick}
      />
      <main>
        <Homepage />
      </main>
    </div>
  );
};

export default App;