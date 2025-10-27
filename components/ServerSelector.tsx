import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { DiscordGuild } from '../types';
import { SpinnerIcon, PlusIcon, ChevronRightIcon, LogInIcon } from './icons/Icons';
import { supabase } from '../lib/supabaseClient';

const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1430883691944738958&permissions=8&integration_type=0&scope=bot';

interface ServerListItemProps {
  guild: DiscordGuild;
  hasBot: boolean;
  onSelect: (guild: DiscordGuild) => void;
  index: number;
}

const ServerListItem: React.FC<ServerListItemProps> = ({ guild, hasBot, onSelect, index }) => {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id.slice(-1)) % 5}.png`;

  const commonClasses = "w-full flex items-center justify-between p-3 bg-nexus-overlay/30 border border-transparent hover:bg-nexus-overlay/80 hover:border-nexus-accent-primary/30 rounded-lg transition-all duration-200 animate-fade-in-up hover:shadow-[0_0_15px_rgba(0,180,255,0.1)] text-left";
  
  const content = (
    <>
      <div className="flex items-center gap-4 overflow-hidden">
        <img src={iconUrl} alt={`${guild.name} icon`} className="w-12 h-12 rounded-lg flex-shrink-0" loading="lazy" />
        <p className="font-semibold text-nexus-primary-text truncate">{guild.name}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 text-nexus-secondary-text flex-shrink-0" />
    </>
  );

  return (
    <div 
        className={`shine-effect transition-opacity ${!hasBot ? 'opacity-60 grayscale-[50%]' : ''}`}
        style={{ animationDelay: `${index * 50}ms` }}
    >
        {hasBot ? (
            <button onClick={() => onSelect(guild)} className={commonClasses}>
                {content}
            </button>
        ) : (
            <a href={BOT_INVITE_URL + `&guild_id=${guild.id}`} target="_blank" rel="noopener noreferrer" className={commonClasses}>
                {content}
            </a>
        )}
    </div>
  );
};


interface ServerSelectorProps {
  session: Session;
  onServerSelected: (server: DiscordGuild) => void;
  onLogin: () => void;
}

const ServerSelector: React.FC<ServerSelectorProps> = ({ session, onServerSelected, onLogin }) => {
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [botGuildIds, setBotGuildIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!session) {
        setLoading(false);
        return;
    };

    const fetchAndProcessGuilds = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const cacheKey = `guilds-cache-${session.user.id}`;
      
      try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            const { guilds: cachedGuilds, botGuildIds: cachedBotGuildIds } = JSON.parse(cachedData);
            setGuilds(cachedGuilds);
            setBotGuildIds(new Set(cachedBotGuildIds));
            setLoading(false);
            loadingRef.current = false;
            return;
        }

        const { data: guildData, error: guildError } = await supabase.functions.invoke('get-guilds');
        
        if (guildError) {
          sessionStorage.removeItem(cacheKey); // IMPORTANT: Clear cache on any failure
          const errorBody = await guildError.context.json();
          throw new Error(errorBody.error || 'An unknown error occurred while fetching servers.');
        }

        const adminGuilds: DiscordGuild[] = guildData.guilds;
        const adminGuildIds = adminGuilds.map(g => g.id);
        
        const { data: functionData, error: functionError } = await supabase.functions.invoke('get-common-guilds', {
            body: { userGuildIds: adminGuildIds },
        });
        
        if (functionError) {
            throw new Error(`Failed to check server status: ${functionError.message}`);
        }
        
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
        
        const cacheValue = JSON.stringify({ guilds: adminGuilds, botGuildIds: Array.from(commonGuildIds) });
        sessionStorage.setItem(cacheKey, cacheValue);

      } catch (e: any) {
        setError(e.message);
        console.error("Error fetching guilds:", e);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    fetchAndProcessGuilds();
  }, [session]);

  const isAuthError = error && (error.toLowerCase().includes('authentication error') || error.toLowerCase().includes('discord connection expired'));

  return (
    <>
    <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
        /* Custom scrollbar for server list */
        .server-list::-webkit-scrollbar {
            width: 8px;
        }
        .server-list::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        .server-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        .server-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `}</style>
    <div className="w-full max-w-lg animate-fade-in-up" style={{animationDelay: '150ms'}}>
        <div className="bg-nexus-surface/70 border border-white/5 rounded-xl p-4 backdrop-blur-sm min-h-[300px] flex flex-col">
            {loading && (
            <div className="flex-1 flex justify-center items-center">
                <SpinnerIcon className="h-8 w-8 text-nexus-accent-primary" />
            </div>
            )}

            {error && (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <p className="font-semibold text-nexus-danger">An Error Occurred</p>
                    <p className="text-nexus-secondary-text text-sm mt-1 max-w-sm">{error}</p>
                    {isAuthError && (
                        <button
                            onClick={onLogin}
                            className="flex items-center justify-center gap-2 px-5 py-2 mt-4 text-sm font-medium text-white bg-gradient-to-br from-nexus-accent-start to-nexus-accent-glow rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-accent-primary focus:ring-offset-nexus-background transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,180,255,0.3)]"
                        >
                            <LogInIcon className="h-4 w-4" />
                            <span>Re-authenticate with Discord</span>
                        </button>
                    )}
                </div>
            )}
            
            {!loading && !error && (
                guilds.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 server-list">
                        {guilds.map((guild, index) => (
                            <ServerListItem 
                                key={guild.id}
                                guild={guild}
                                hasBot={botGuildIds.has(guild.id)}
                                onSelect={onServerSelected}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                        <p className="text-nexus-secondary-text">No servers found where you have admin permissions.</p>
                         <a
                          href={BOT_INVITE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-nexus-surface border border-white/10 rounded-md hover:border-white/20 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>Invite Flamey to a Server</span>
                        </a>
                    </div>
                )
            )}
        </div>
    </div>
    </>
  );
};

export default ServerSelector;