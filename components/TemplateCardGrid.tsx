import React from 'react';
import { GiftIcon, ShieldCheckIcon, LifeBuoyIcon, BotIcon, StarIcon } from './icons/Icons';

const templates = [
  {
    icon: <GiftIcon className="h-6 w-6 text-slate-300" />,
    title: 'Advanced Giveaways',
    description: 'Host engaging giveaways with customizable requirements, duration, and prize settings to boost server activity.',
    className: 'lg:col-start-1 lg:row-start-1',
    delay: '0ms'
  },
  {
    icon: <ShieldCheckIcon className="h-6 w-6 text-slate-300" />,
    title: 'Auto Moderation',
    description: 'Keep your community safe with powerful auto-moderation that filters spam, links, bad words, and more.',
    className: 'lg:col-start-1 lg:row-start-2',
    delay: '100ms'
  },
  {
    icon: <LifeBuoyIcon className="h-6 w-6 text-slate-300" />,
    title: 'Ticket System',
    description: 'Provide seamless support with a professional ticket system. Easily manage user inquiries in dedicated private channels.',
    className: 'lg:col-start-2 lg:row-start-1 lg:row-span-2',
    delay: '200ms'
  },
  {
    icon: <BotIcon className="h-6 w-6 text-slate-300" />,
    title: 'AI Powered Chatbot',
    description: 'Engage your community with a smart AI chatbot that can answer questions and chat with users.',
    className: 'lg:col-start-3 lg:row-start-1',
    delay: '300ms'
  },
  {
    icon: <StarIcon className="h-6 w-6 text-slate-300" />,
    title: 'Reaction Roles',
    description: 'Let users self-assign roles by reacting to messages. A simple way to manage access and personalization.',
    className: 'lg:col-start-3 lg:row-start-2',
    delay: '400ms'
  },
];


const TemplateCardGrid: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes unfold {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(45deg) translateY(60px);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(0deg) translateY(0px);
          }
        }
        .animate-unfold {
          transform-origin: bottom center;
          animation: unfold 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 75%;
          height: 100%;
          background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
          transform: skewX(-25deg);
          transition: left 0.75s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .shine-effect:hover::after {
          left: 150%;
        }
      `}</style>

      <section id="features" className="pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <div className="inline-block rounded-full bg-nexus-accent-primary/10 px-4 py-1.5 mb-4">
                <p className="text-sm font-semibold tracking-wider text-nexus-accent-glow uppercase">Core Features</p>
            </div>
            <h2 className="text-3xl font-bold text-nexus-primary-text sm:text-4xl">
              Built to Empower <span className="text-gradient-blue">Your Community</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-nexus-secondary-text">
              Flamey is packed with powerful, fully customizable modules to bring your server to the next level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.title}
                className={`
                  ${template.className} 
                  animate-unfold shine-effect text-left h-full flex flex-col
                  ${template.title === 'Ticket System' ? 'justify-between' : ''}
                  bg-nexus-surface/40 backdrop-blur-sm rounded-xl border border-white/5
                  p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                  transition-all duration-300 hover:border-nexus-accent-primary/50 hover:shadow-[0_0_25px_rgba(0,180,255,0.1)]
                `}
                style={{ animationDelay: template.delay }}
              >
                <div className="bg-nexus-overlay/50 p-2.5 rounded-lg border border-white/5 w-min mb-4">
                  {template.icon}
                </div>
                <div className={`${template.title !== 'Ticket System' ? 'flex-1 flex flex-col' : ''}`}>
                  <h3 className="font-bold text-white text-lg">{template.title}</h3>
                  <p className={`mt-2 text-nexus-secondary-text text-sm ${template.title !== 'Ticket System' ? 'flex-1' : ''}`}>{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TemplateCardGrid;