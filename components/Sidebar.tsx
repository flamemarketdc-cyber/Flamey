import React, { useState } from 'react';
import { ChevronDownIcon, XIcon } from './icons/Icons';
import { type Feature } from '../types';
import { navItems } from '../lib/dashboardConfig';

interface SidebarProps {
  activeFeature: Feature;
  setActiveFeature: (feature: Feature) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContent: React.FC<{
    activeFeature: Feature; 
    setActiveFeature: (feature: Feature) => void; 
}> = ({ activeFeature, setActiveFeature }) => {
    const [openDropdown, setOpenDropdown] = useState<Feature | null>(() => {
        for (const item of navItems) {
            if (item.type === 'dropdown' && item.children.some(child => child.id === activeFeature)) {
                return item.id;
            }
        }
        return null;
    });
    
    const handleNavClick = (feature: Feature) => {
      setActiveFeature(feature);
    };

    const handleDropdownClick = (feature: Feature) => {
      setOpenDropdown(prev => prev === feature ? null : feature);
    };

    return (
    <>
    <style>{`
        .sidebar-scroll-container::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll-container::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .sidebar-scroll-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
    `}</style>
    <div className="flex-1 overflow-y-auto sidebar-scroll-container pr-2">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item, index) => {
            if (item.type === 'heading') {
              return (
                <h3 key={index} className="px-3 pt-4 pb-2 text-xs font-semibold text-nexus-secondary-text/60 uppercase tracking-wider">{item.name}</h3>
              );
            }

            if (item.type === 'dropdown') {
              const isOpen = openDropdown === item.id;
              const isChildActive = item.children.some(child => child.id === activeFeature);
              return (
                 <div key={item.id}>
                    <button
                        onClick={() => handleDropdownClick(item.id)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out group ${
                            isChildActive
                            ? 'text-nexus-primary-text'
                            : 'text-nexus-secondary-text hover:bg-white/5 hover:text-nexus-primary-text'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors ${isChildActive ? 'text-nexus-accent-primary' : 'text-nexus-secondary-text/70 group-hover:text-nexus-secondary-text'}`}>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="pl-6 pt-1 pb-1 space-y-1 mt-1 border-l-2 border-white/5 ml-5">
                            {item.children.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => handleNavClick(child.id)}
                                    className={`w-full text-left text-sm rounded-md px-4 py-2 transition-colors ${
                                        activeFeature === child.id
                                            ? 'text-nexus-accent-primary font-semibold'
                                            : 'text-nexus-secondary-text hover:text-nexus-accent-primary/80'
                                    }`}
                                >
                                    {child.name}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
              );
            }

            const isActive = activeFeature === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out group relative border-l-4 ${
                  isActive
                    ? 'bg-nexus-hover text-nexus-accent-primary border-nexus-accent-primary'
                    : 'text-nexus-secondary-text hover:bg-white/5 hover:text-nexus-primary-text border-transparent'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-nexus-accent-primary' : 'text-nexus-secondary-text/70 group-hover:text-nexus-secondary-text'}`}>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
    </div>
    </>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, isOpen, setIsOpen }) => {
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=6900a28e&is=68ff510e&hm=55362ed4d121e81fe0dc951403a97ab16d1a2eaa3665fee12008be22e94b03c0&=&format=webp&quality=lossless&width=394&height=394';
  
  const SidebarContainer: React.FC<{children: React.ReactNode}> = ({children}) => (
     <div className="relative h-full flex flex-col bg-nexus-sidebar-bg">
        {children}
     </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-full h-full flex-shrink-0 flex-col">
        <SidebarContainer>
            <SidebarContent 
                activeFeature={activeFeature} 
                setActiveFeature={setActiveFeature} 
            />
        </SidebarContainer>
      </aside>
      
      {/* Mobile Sidebar */}
       <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)}></div>
            <aside className={`relative flex w-64 h-full flex-shrink-0 flex-col transition-transform duration-300 bg-nexus-sidebar-bg ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <SidebarContainer>
                    <div className="flex justify-between items-center h-16 px-4 border-b border-white/5 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
                            <span className="text-xl font-bold tracking-tight text-white">Flamey</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 text-nexus-secondary-text hover:text-white">
                            <XIcon className="h-6 w-6"/>
                        </button>
                    </div>
                    <SidebarContent 
                        activeFeature={activeFeature} 
                        setActiveFeature={(feature) => { setActiveFeature(feature); setIsOpen(false); }} 
                    />
                 </SidebarContainer>
            </aside>
        </div>
    </>
  );
};

export default Sidebar;