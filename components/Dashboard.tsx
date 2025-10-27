import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import { type Feature, type DiscordGuild } from '../types';
import { MenuIcon, ChevronDownIcon, LogOutIcon, SpinnerIcon, PlusIcon, ChevronRightIcon } from './icons/Icons';
import { supabase } from '../lib/supabaseClient';

const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1430883691944738958&permissions=8&integration_type=0&scope=bot';


interface DashboardHeaderProps {
  session: Session;
  onLogout: () => void;
  server: DiscordGuild;
  onGoToServerSelector: () => void;
  onServerSelected: (server: DiscordGuild) => void;
  onLogin: () => void;
  onToggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ session, onLogout, server, onGoToServerSelector, onServerSelected, onLogin, onToggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const serverMenuRef = useRef<HTMLDivElement>(null);
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=6900a28e&is=68ff510e&hm=55362ed4d121e81fe0dc951403a97ab16d1a2eaa3665fee12008be22e94b03c0&=&format=webp&quality=lossless&width=394&height=394';

  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [botGuildIds, setBotGuildIds] = useState<Set<string>>(new Set());
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [guildError, setGuildError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const serverIconUrl = server.icon
    ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(server.id.slice(-1)) % 5}.png`;
  const userAvatarUrl = session.user.user_metadata?.avatar_url || `https://i.pravatar.cc/40`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
      if (serverMenuRef.current && !serverMenuRef.current.contains(event.target as Node)) setIsServerMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isServerMenuOpen) return;

    const fetchAndProcessGuilds = async () => {
      setLoadingGuilds(true);
      setGuildError(null);

      try {
        const { data: guildData, error: guildError } = await supabase.functions.invoke('get-guilds');
        
        if (guildError) {
          const errorBody = await guildError.context.json();
          throw new Error(errorBody.error || 'An unknown error occurred while fetching guilds.');
        }

        const adminGuilds: DiscordGuild[] = guildData.guilds;
        const adminGuildIds = adminGuilds.map(g => g.id);
        
        const { data: functionData, error: functionError } = await supabase.functions.invoke('get-common-guilds', { body: { userGuildIds: adminGuildIds } });
        if (functionError) throw new Error(`Function error: ${functionError.message}`);
        
        const commonGuildIds = new Set<string>(functionData.commonGuildIds);
        setBotGuildIds(commonGuildIds);

        adminGuilds.sort((a, b) => {
            const aHasBot = commonGuildIds.has(a.id);
            const bHasBot = commonGuildIds.has(b.id);
            if (aHasBot && !bHasBot) return -1;
            if (!aHasBot && bHasBot) return 1;
            return a.name.localeCompare(b.name);
        });
        setGuilds(adminGuilds);
      } catch (e: any) {
        setGuildError(e.message);
      } finally {
        setLoadingGuilds(false);
      }
    };
    fetchAndProcessGuilds();
  }, [isServerMenuOpen, session]);
  
  const filteredGuilds = useMemo(() => guilds.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) && botGuildIds.has(g.id)
  ), [guilds, searchTerm, botGuildIds]);

  const handleSelectServer = (g: DiscordGuild) => {
    onServerSelected(g);
    setIsServerMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-16 bg-nexus-overlay/80 backdrop-blur-sm border-b border-white/5 z-30 flex items-center justify-between px-6 md:px-8">
        {/* Left Side */}
        <div className="flex items-center gap-2 lg:w-64">
            <button onClick={onToggleSidebar} className="p-2 md:hidden text-nexus-secondary-text hover:text-nexus-primary-text">
                <MenuIcon className="h-6 w-6" />
            </button>
            <a href="#/" className="hidden md:flex items-center gap-3 cursor-pointer">
                <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-nexus-primary-text tracking-wide">Flamey</span>
            </a>
        </div>

        {/* Middle (Server Selector) */}
        <div className="flex-1 flex justify-center">
            <div className="relative" ref={serverMenuRef}>
                <button onClick={() => setIsServerMenuOpen(!isServerMenuOpen)} className="flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <img src={serverIconUrl} alt="Server Icon" className="w-8 h-8 rounded-md flex-shrink-0" />
                    <div className="hidden sm:block flex-1 min-w-0">
                        <p className="font-semibold text-nexus-primary-text text-sm truncate">{server.name}</p>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-nexus-secondary-text flex-shrink-0 transition-transform ${isServerMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isServerMenuOpen && (
                <div className="absolute top-full mt-2 w-72 left-1/2 -translate-x-1/2 bg-nexus-overlay border border-white/5 rounded-xl shadow-2xl p-2 z-30 animate-fade-in-up">
                    <input type="text" placeholder="Search servers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-nexus-surface border-2 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-0 focus:border-nexus-accent-primary transition-colors" />
                    <div className="max-h-60 overflow-y-auto mt-2 space-y-1 pr-1 server-list">
                    {loadingGuilds ? <div className="flex justify-center p-4"><SpinnerIcon className="h-6 w-6 text-nexus-accent-primary" /></div> :
                    guildError ? <p className="text-nexus-danger text-xs p-2">{guildError}</p> :
                    filteredGuilds.map(g => (
                        <button key={g.id} onClick={() => handleSelectServer(g)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/5 text-left">
                            <img src={g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=64` : `https://cdn.discordapp.com/embed/avatars/${parseInt(g.id.slice(-1)) % 5}.png`} alt="" className="w-8 h-8 rounded-md" />
                            <span className="truncate text-sm font-medium flex-1">{g.name}</span>
                        </button>
                    ))}
                    </div>
                    <div className="border-t border-white/5 mt-2 pt-2">
                        <button onClick={onGoToServerSelector} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/5 text-left text-sm font-medium">
                            <span>Manage Servers</span>
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 justify-end lg:w-64">
            <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors">
                    <img src={userAvatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full" />
                    <span className="hidden lg:inline font-medium text-sm text-nexus-primary-text">{session.user.user_metadata?.name || 'User'}</span>
                    <ChevronDownIcon className="h-4 w-4 hidden lg:inline text-nexus-secondary-text" />
                </button>
                {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-nexus-overlay border border-white/5 rounded-xl shadow-2xl p-2 z-30 animate-fade-in-up">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 p-2 rounded-md text-nexus-secondary-text hover:text-nexus-primary-text hover:bg-white/5 text-left text-sm font-medium transition-colors">
                    <LogOutIcon className="h-4 w-4" />
                    <span>Logout</span>
                    </button>
                </div>
                )}
            </div>
        </div>
    </header>
  );
};


interface DashboardProps {
  session: Session;
  onLogout: () => void;
  server: DiscordGuild;
  onGoToServerSelector: () => void;
  onServerSelected: (server: DiscordGuild) => void;
  onLogin: () => void;
}

const getFeatureFromHash = (): Feature => {
    const path = window.location.hash.substring(1); // e.g., /dashboard/general_settings
    const parts = path.split('/');
    if (parts[1] === 'dashboard' && parts[2]) {
        return parts[2] as Feature; // Assume it's a valid feature, DashboardContent will handle invalid ones.
    }
    return 'dashboard_home';
};

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout, server, onGoToServerSelector, onServerSelected, onLogin }) => {
    const [activeFeature, setActiveFeature] = useState<Feature>(getFeatureFromHash());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            setActiveFeature(getFeatureFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        
        // Set initial valid hash if needed
        const currentHash = window.location.hash;
        if (!currentHash.startsWith('#/dashboard/') || currentHash === '#/dashboard' || currentHash === '#/dashboard/') {
            window.location.replace(`#/dashboard/dashboard_home`);
        }
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const handleResize = () => { if (mediaQuery.matches) setIsSidebarOpen(false); };
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);
    
    const handleSetActiveFeature = (feature: Feature) => {
        window.location.hash = `#/dashboard/${feature}`;
    };

    return (
        <div className="w-full h-screen bg-nexus-background text-nexus-primary-text overflow-hidden">
            <DashboardHeader 
                session={session} 
                onLogout={onLogout} 
                server={server}
                onGoToServerSelector={onGoToServerSelector}
                onServerSelected={onServerSelected}
                onLogin={onLogin}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex h-full w-full pt-16">
                 <div className="w-64 flex-shrink-0 hidden md:block">
                     <Sidebar 
                        activeFeature={activeFeature}
                        setActiveFeature={handleSetActiveFeature}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />
                </div>
                {/* Mobile sidebar needs to be handled outside the main layout flow */}
                 <div className="md:hidden">
                     <Sidebar 
                        activeFeature={activeFeature}
                        setActiveFeature={handleSetActiveFeature}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />
                </div>
                
                <main className="flex-1 overflow-y-auto main-content min-w-0 h-full">
                    <style>{`
                        .main-content::-webkit-scrollbar { width: 8px; }
                        .main-content::-webkit-scrollbar-track { background: transparent; }
                        .main-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                        .main-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                    `}</style>
                    <div className="max-w-6xl mx-auto px-6 md:px-8 py-10">
                        <DashboardContent feature={activeFeature} server={server} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;