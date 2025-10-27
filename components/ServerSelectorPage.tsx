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
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=68ff510e&is=68fdff8e&hm=6bfb1d8007bbbb8758d7f3bbbfc35a78d603e9455b3156289ac0342c6f95d021&=&format=webp&quality=lossless&width=842&height=842';
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 selection:bg-nexus-accent-primary/20">
       <div className="absolute top-0 left-0 p-6">
         <a href="#/" className="flex items-center gap-3">
          <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-nexus-primary-text">Flamey</span>
        </a>
       </div>
       
      <main className="w-full flex flex-col items-center justify-center text-center px-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-nexus-primary-text mb-3">Select a Server</h1>
          <p className="max-w-md mx-auto text-nexus-secondary-text">Choose a server you'd like to configure. Only servers where you have <span className="text-nexus-primary-text font-medium">Administrator</span> permissions are shown.</p>
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