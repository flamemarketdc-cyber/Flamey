import React from 'react';
import { SwooshIcon, LogInIcon, ArrowRightIcon } from './icons/Icons';
import TemplateCardGrid from './TemplateCardGrid';
import Stats from './Stats';
import Testimonials from './Testimonials';
import Footer from './Footer';

interface HomepageProps {
  onLogin: () => void;
}

const AnimatedTitle = ({ text, gradientText }: { text: string; gradientText?: string }) => {
  const textToShow = gradientText ? text.replace(gradientText, '') : text;
  const parts = gradientText ? text.split(gradientText) : [textToShow];

  const renderText = (str: string, isGradient: boolean = false) =>
    [...str].map((char, index) => (
      <span
        key={index}
        className={`letter-hover ${isGradient ? 'text-gradient-blue text-glow-blue' : 'text-glow-white'}`}
        style={{ transitionDelay: `${index * 15}ms` }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <>
      {renderText(parts[0])}
      {gradientText && (
         <span className="relative inline-block">
            {renderText(gradientText, true)}
            <SwooshIcon className="absolute -bottom-4 sm:-bottom-5 left-0 w-full h-6 text-nexus-accent-primary" />
         </span>
      )}
      {parts[1] && renderText(parts[1])}
    </>
  );
};


const Homepage: React.FC<HomepageProps> = ({ onLogin }) => {
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-16 sm:pt-24 sm:pb-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-nexus-primary-text mb-8 sm:mb-10">
            <AnimatedTitle text="Multi-purpose Discord Bot." gradientText="Discord" />
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg text-nexus-secondary-text">
          Robust moderation, engaging AI, and powerful tools to build your ultimate community.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onLogin}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-white bg-gradient-to-br from-nexus-accent-start to-nexus-accent-glow rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-accent-primary focus:ring-offset-nexus-background transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,180,255,0.4)]"
          >
            <LogInIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span>Login with Discord</span>
          </button>
          <a
            href="#features"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 text-base font-semibold text-nexus-secondary-text bg-transparent border border-white/10 rounded-xl hover:bg-white/5 hover:text-nexus-primary-text transition-all duration-300 hover:scale-105"
        >
            <span>Explore Features</span>
        </a>
        </div>
      </div>
      <TemplateCardGrid />
      <Stats />
      <Testimonials />
      <div className="text-center pb-20 -mt-8 sm:-mt-12">
        <a 
          href="#/all-features" 
          className="group inline-flex items-center gap-2.5 text-lg font-medium text-nexus-secondary-text hover:text-nexus-primary-text transition-all duration-300 text-glow-white"
        >
          <span>Explore all features</span>
          <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </a>
      </div>
      <Footer />
    </>
  );
};

export default Homepage;