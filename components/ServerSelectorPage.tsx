import React from 'react';
import type { Session } from '@supabase/supabase-js';
import ServerSelector from './ServerSelector';
import { DiscordGuild } from '../types';

interface ServerSelectorPageProps {
  session: Session;
  onServerSelected: (server: DiscordGuild) => void;
  onLogin: () => void;
  onLogout: () => void;
}

const ServerSelectorPage: React.FC<ServerSelectorPageProps> = ({ session, onServerSelected, onLogin, onLogout }) => {
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=6900a28e&is=68ff510e&hm=55362ed4d121e81fe0dc951403a97ab16d1a2eaa3665fee12008be22e94b03c0&=&format=webp&quality=lossless&width=394&height=394';
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 selection:bg-nexus-accent-primary/20">
      <main className="w-full flex flex-col items-center justify-center text-center px-4">
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <img src={logoUrl} alt="Flamey Logo" className="h-20 w-20" />
          <h1 className="text-4xl font-black tracking-tighter text-nexus-primary-text">
            Select a Server
          </h1>
        </div>
        
        <ServerSelector 
          session={session} 
          onServerSelected={onServerSelected}
          onLogin={onLogin} 
        />
      </main>
    </div>
  );
};

export default ServerSelectorPage;