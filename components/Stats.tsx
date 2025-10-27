import React, { useState, useEffect, useRef } from 'react';

const StatItem = ({ value, label, duration = 2000 }: { value: number; label: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const finalValue = value;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = finalValue;
          if (start === end) return;

          let startTime: number | null = null;
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if(currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [finalValue, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      const value = (num / 1000000);
      return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'M+';
    }
    if (num >= 1000) {
        const value = (num / 1000);
        return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'K+';
    }
    return num.toLocaleString() + '+';
  };

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl sm:text-5xl font-black text-gradient-blue tracking-tighter">{formatNumber(count)}</p>
      <p className="mt-2 text-sm sm:text-base font-medium text-nexus-secondary-text uppercase tracking-widest">{label}</p>
    </div>
  );
};

const Stats: React.FC = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-nexus-surface/50 border border-white/5 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StatItem value={1500000} label="Servers" />
            <StatItem value={25000000} label="Users" />
            <StatItem value={500000000} label="Commands" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
