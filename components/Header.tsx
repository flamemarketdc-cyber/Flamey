import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LogInIcon, LogOutIcon, MenuIcon, XIcon, LayoutGridIcon } from './icons/Icons';

interface HeaderProps {
  session: Session | null;
  onLogin: () => void;
  onLogout: () => void;
  onDashboardClick?: () => void;
}

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Commands', href: '#' },
  { name: 'Premium', href: '#' },
  { name: 'Support', href: '#' },
];

const Header: React.FC<HeaderProps> = ({ session, onLogin, onLogout, onDashboardClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=6900a28e&is=68ff510e&hm=55362ed4d121e81fe0dc951403a97ab16d1a2eaa3665fee12008be22e94b03c0&=&format=webp&quality=lossless&width=394&height=394';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleAuthAction = session ? onDashboardClick : onLogin;

  return (
    <>
      <header className="sticky top-0 z-50 w-full p-4 transition-all duration-500 ease-in-out cursor-text">
        <div className={`
          mx-auto flex items-center justify-between
          transition-all duration-500 ease-in-out
          ${isScrolled
            ? 'max-w-5xl h-16 px-6 bg-nexus-overlay/60 backdrop-blur-lg rounded-2xl shadow-[0_0_25px_rgba(0,180,255,0.1)] ring-1 ring-white/10'
            : 'max-w-7xl h-16 px-6 ring-1 ring-transparent'
          }
        `}>
            <a href="#/" className="flex items-center space-x-2 cursor-pointer">
              <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
              <span className="text-lg font-semibold tracking-tight text-nexus-primary-text">Flamey</span>
            </a>
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="text-sm font-medium text-nexus-secondary-text hover:text-nexus-accent-start transition-colors duration-200 ease-in-out rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={session ? onDashboardClick : onLogin}
                className="hidden md:flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-br from-nexus-accent-start to-nexus-accent-glow rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-accent-primary focus:ring-offset-nexus-background transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,180,255,0.3)] cursor-pointer"
              >
                {session ? (
                  <>
                    <LayoutGridIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-4 w-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
              {session && (
                 <button
                    onClick={onLogout}
                    className="hidden md:flex items-center justify-center p-2 text-nexus-secondary-text hover:text-nexus-primary-text hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    aria-label="Logout"
                 >
                    <LogOutIcon className="h-5 w-5" />
                </button>
              )}
              <button className="md:hidden cursor-pointer" onClick={() => setIsMenuOpen(true)}>
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-nexus-background p-4 transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <a href="#/" className="flex items-center space-x-3">
              <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight text-white">Flamey</span>
          </a>
          <button onClick={() => setIsMenuOpen(false)}>
            <XIcon className="h-6 w-6"/>
          </button>
        </div>
        <nav className="flex flex-col items-center justify-center gap-6 text-center">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-xl font-medium text-nexus-secondary-text hover:text-nexus-accent-start">
                {link.name}
              </a>
            ))}
             <button
                onClick={() => {
                  if (handleAuthAction) handleAuthAction();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 text-base font-medium text-white bg-gradient-to-br from-nexus-accent-start to-nexus-accent-glow rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-accent-primary focus:ring-offset-nexus-background transition-colors duration-200"
              >
                {session ? (
                  <>
                    <LayoutGridIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <LogInIcon className="h-5 w-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
              {session && (
                 <button
                    onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 text-base font-medium text-nexus-secondary-text bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                    aria-label="Logout"
                 >
                    <LogOutIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
              )}
        </nav>
      </div>
    </>
  );
};

export default Header;