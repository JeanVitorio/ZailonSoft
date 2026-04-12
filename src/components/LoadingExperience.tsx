import { useState, useEffect } from 'react';
import jeanHero from '@/assets/jean-hero.jpg';

export function LoadingExperience({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'meteor' | 'brand' | 'done'>('meteor');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Meteor phase: 1.5s, then brand
    const t1 = setTimeout(() => setPhase('brand'), 1500);
    // Brand shows for 2.5s then fade
    const t2 = setTimeout(() => setFadeOut(true), 4000);
    const t3 = setTimeout(onComplete, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 9999, background: 'oklch(0.02 0.003 250)' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              background: 'white',
              opacity: Math.random() * 0.6 + 0.1,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Epic meteor crossing screen */}
      {phase === 'meteor' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="loading-meteor" />
          <div className="loading-meteor-2" />
        </div>
      )}

      {/* Brand reveal */}
      {phase === 'brand' && (
        <div className="text-center flex flex-col items-center animate-brand-photo">
          <div className="mb-6 sm:mb-8">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden mx-auto"
              style={{
                border: '2px solid var(--ember)',
                boxShadow: '0 0 40px oklch(0.65 0.22 30 / 0.5), 0 0 80px oklch(0.65 0.22 30 / 0.2)',
              }}
            >
              <img src={jeanHero} alt="Jean" className="w-full h-full object-cover" width={768} height={768} />
            </div>
          </div>
          <h1
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-widest animate-brand-reveal"
            style={{ color: 'oklch(0.65 0.22 30)' }}
          >
            ZAILONSOFT
          </h1>
          <div className="mt-3 sm:mt-4 h-px mx-auto animate-expand-line" style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.65 0.22 30), transparent)',
            maxWidth: '300px',
          }} />
          <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase animate-fade-up" style={{
            color: 'oklch(0.5 0.01 250)',
            animationDelay: '0.6s',
            animationFillMode: 'both',
          }}>
            Engenharia Digital de Alta Performance
          </p>
        </div>
      )}
    </div>
  );
}
