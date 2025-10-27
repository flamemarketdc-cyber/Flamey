import React from 'react';
import { QuoteIcon } from './icons/Icons';

const testimonials = [
  {
    quote: "Flamey completely transformed our server management. The auto-moderation is a lifesaver and the AI is surprisingly fun for our members.",
    name: 'Alex "Synth"',
    title: 'Admin @ Galaxy Gamers',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
  },
  {
    quote: "The ticket system is incredibly intuitive. It's the most professional and easy-to-use support tool we've ever had on our Discord.",
    name: 'Sarah Chen',
    title: 'Community Manager @ DevHub',
    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
  },
  {
    quote: "Our engagement has skyrocketed since we started using the giveaway and leveling modules. Flamey is a must-have for any serious community.",
    name: 'Mikey "Raptor"',
    title: 'Owner @ The Gaming Den',
    avatar: 'https://cdn.discordapp.com/embed/avatars/2.png'
  },
  {
    quote: "As a server owner, my biggest concern is safety. Flamey's robust logging and moderation tools give me complete peace of mind.",
    name: 'Isabelle Rodriguez',
    title: 'Founder @ Creative Corner',
    avatar: 'https://cdn.discordapp.com/embed/avatars/3.png'
  },
  {
    quote: "The level of customization is insane. We've been able to tweak everything to perfectly match our server's theme. 10/10 bot.",
    name: 'David Kim',
    title: 'Moderator @ Anime Central',
    avatar: 'https://cdn.discordapp.com/embed/avatars/4.png'
  },
];

const TestimonialCard: React.FC<typeof testimonials[0]> = ({ quote, name, title, avatar }) => (
    <li className="flex-shrink-0 w-80 sm:w-96 mx-4 p-6 bg-nexus-surface/60 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col">
        <QuoteIcon className="h-8 w-8 text-nexus-accent-primary/80 mb-4" />
        <p className="text-nexus-secondary-text flex-grow">"{quote}"</p>
        <div className="flex items-center mt-6 pt-6 border-t border-white/5">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
            <div className="ml-4">
                <p className="font-semibold text-nexus-primary-text">{name}</p>
                <p className="text-sm text-nexus-secondary-text">{title}</p>
            </div>
        </div>
    </li>
);

const Testimonials: React.FC = () => {
    // Duplicate testimonials for seamless loop
    const extendedTestimonials = [...testimonials, ...testimonials];

    return (
        <>
        <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${testimonials.length * (20 + 1) /* 20rem (w-80) + 1rem (mx-4) */}rem)); }
            }
            .scrolling-wrapper {
                animation: scroll 60s linear infinite;
            }
            .scrolling-container:hover .scrolling-wrapper {
                animation-play-state: paused;
            }
        `}</style>
        <section className="py-20 sm:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <div className="inline-block rounded-full bg-nexus-accent-primary/10 px-4 py-1.5 mb-4">
                    <p className="text-sm font-semibold tracking-wider text-nexus-accent-glow uppercase">Testimonials</p>
                </div>
                <h2 className="text-3xl font-bold text-nexus-primary-text sm:text-4xl">
                  Loved by <span className="text-gradient-blue">Community Leaders</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-nexus-secondary-text">
                  Don't just take our word for it. Here's what server owners and admins are saying about Flamey.
                </p>
            </div>
            <div className="mt-16 scrolling-container relative">
                <ul className="flex scrolling-wrapper">
                    {extendedTestimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </ul>
                 {/* Fades on sides */}
                <div className="absolute top-0 left-0 h-full w-16 sm:w-32 bg-gradient-to-r from-nexus-background to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-full w-16 sm:w-32 bg-gradient-to-l from-nexus-background to-transparent pointer-events-none"></div>
            </div>
        </section>
        </>
    );
}

export default Testimonials;
