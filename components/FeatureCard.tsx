import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-xl p-6 transition-all duration-300 hover:border-nexus-accent-primary/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-nexus-accent-primary/20">
      <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-lg bg-nexus-accent-primary/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-nexus-primary-text">{title}</h3>
      <p className="mt-2 text-base text-nexus-secondary-text">{description}</p>
    </div>
  );
};

export default FeatureCard;