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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedServer, setSelectedServer] = useState<DiscordGuild | null>(null);
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

  // --- Restore Server Selection ---
  useEffect(() => {
    if (session && route.startsWith('/dashboard') && !selectedServer) {
      const lastServerJson = localStorage.getItem('lastSelectedServer');
      if (lastServerJson) {
        try {
          setSelectedServer(JSON.parse(lastServerJson));
        } catch {
          localStorage.removeItem('lastSelectedServer');
          navigate('/select-server');
        }
      } else {
        navigate('/select-server');
      }
    }
  }, [session, route, selectedServer, navigate]);

  // --- LOGIN HANDLER (FIXED) ---
  const handleLogin = async () => {
    // Redirect to a dedicated callback page to isolate the Supabase client's
    // token processing from the main React app's lifecycle and routing.
    // This provides a "clean room" for the auth hash to be processed reliably.
    const redirectURL = `${window.location.origin}/callback.html`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        scopes: 'identify email guilds',
        // We ensure offline access is requested to get a refresh_token,
        // which allows the session to be maintained. 'consent' is used to
        // ensure the user re-approves permissions, fixing potential scope issues.
        queryParams: {
          prompt: 'consent',
          access_type: 'offline',
        },
        redirectTo: redirectURL,
      },
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
    const lastServerJson = localStorage.getItem('lastSelectedServer');
    if (lastServerJson) {
      try {
        const server = JSON.parse(lastServerJson) as DiscordGuild;
        setSelectedServer(server);
        navigate('/dashboard');
      } catch {
        localStorage.removeItem('lastSelectedServer');
        navigate('/select-server');
      }
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
    setSelectedServer(null);
    localStorage.removeItem('lastSelectedServer');
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

      // Show spinner while restoring state
      return (
        <div className="bg-transparent w-full h-full flex items-center justify-center">
          <SpinnerIcon className="h-8 w-8 text-nexus-accent-end" />
        </div>
      );
    }

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
        <Homepage onLogin={handleLogin} />
      </main>
    </div>
  );
};

export default App;