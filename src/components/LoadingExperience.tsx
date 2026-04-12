import { useState, useEffect } from 'react';
import jeanHero from '@/assets/jean-hero.jpg';

export function LoadingExperience({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 3200);
    const t2 = setTimeout(() => { setShow(false); onComplete(); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 9999, background: 'oklch(0.02 0.003 250)' }}
    >
      {/* Subtle stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              background: 'white',
              opacity: Math.random() * 0.5 + 0.1,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Brand reveal with Jean photo */}
      <div className="text-center flex flex-col items-center animate-brand-photo">
        <div className="mb-6 sm:mb-8">
          <div
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto"
            style={{
              border: '2px solid var(--ember)',
              boxShadow: '0 0 50px oklch(0.65 0.22 30 / 0.5), 0 0 100px oklch(0.65 0.22 30 / 0.2)',
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
    </div>
  );
}
