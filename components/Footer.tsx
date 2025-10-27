import React from 'react';

const Footer: React.FC = () => {
  const logoUrl = 'https://media.discordapp.net/attachments/1409211763253051519/1431960946464653523/ChatGPT_Image_Oct_26__2025__03_09_04_PM-removebg.png?ex=68ff510e&is=68fdff8e&hm=6bfb1d8007bbbb8758d7f3bbbfc35a78d603e9455b3156289ac0342c6f95d021&=&format=webp&quality=lossless&width=842&height=842';

  return (
    <footer className="pt-12">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-nexus-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <a href="#/" className="flex-shrink-0">
                <img src={logoUrl} alt="Flamey Logo" className="h-8 w-8" />
            </a>
            <div>
                 <a href="#/"><p className="font-semibold text-nexus-primary-text">Flamey</p></a>
                 <p className="text-sm text-nexus-secondary-text">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-nexus-secondary-text hover:text-nexus-accent-primary transition-colors">Support</a>
            <a href="#" className="text-sm text-nexus-secondary-text hover:text-nexus-accent-primary transition-colors">Privacy</a>
            <a href="#" className="text-sm text-nexus-secondary-text hover:text-nexus-accent-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;