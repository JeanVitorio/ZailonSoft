import { useState, useEffect } from 'react';
import jeanHero from '@/assets/jean-hero.jpg';

const BOOT_LINES = [
  { text: '> Inicializando sistema...', delay: 0 },
  { text: '> Carregando ambiente...', delay: 300 },
  { text: '> Analisando padrões...', delay: 700 },
  { text: '> Construindo experiência...', delay: 1100 },
  { text: '> Ambiente pronto.', delay: 1600 },
];

export function LoadingExperience({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showBrand, setShowBrand] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [particles, setParticles] = useState<Array<{id:number;x:number;y:number;size:number;delay:number}>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 3,
      }))
    );

    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });

    setTimeout(() => setShowBrand(true), 2200);
    setTimeout(() => setFadeOut(true), 4200);
    setTimeout(onComplete, 5000);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 9999, background: 'oklch(0.02 0.003 250)' }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            background: `oklch(0.65 0.22 30 / ${0.2 + Math.random() * 0.3})`,
            animation: `particle-float ${8 + p.delay * 2}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(oklch(0.65 0.22 30 / 0.3) 1px, transparent 1px),
          linear-gradient(90deg, oklch(0.65 0.22 30 / 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="absolute w-full h-px opacity-20" style={{
        background: 'linear-gradient(90deg, transparent, oklch(0.65 0.22 30), transparent)',
        animation: 'scan-line 4s linear infinite',
      }} />

      {!showBrand && (
        <div className="font-mono text-sm md:text-base space-y-2 max-w-md px-6">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className="animate-float-up"
              style={{
                color: i === visibleLines - 1 ? 'oklch(0.65 0.22 30)' : 'oklch(0.5 0.01 250)',
                animationDuration: '0.5s',
              }}
            >
              {line.text}
              {i === visibleLines - 1 && (
                <span className="inline-block w-2 h-4 ml-1 align-middle" style={{
                  background: 'oklch(0.65 0.22 30)',
                  animation: 'blink-caret 0.8s step-end infinite',
                }} />
              )}
            </div>
          ))}
        </div>
      )}

      {showBrand && (
        <div className="text-center flex flex-col items-center">
          {/* Jean photo circle */}
          <div className="mb-8 animate-brand-photo">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 mx-auto"
              style={{ borderColor: 'var(--ember)', boxShadow: '0 0 40px oklch(0.65 0.22 30 / 0.4), 0 0 80px oklch(0.65 0.22 30 / 0.15)' }}>
              <img src={jeanHero} alt="Jean" className="w-full h-full object-cover" width={768} height={768} />
            </div>
          </div>

          <h1
            className="text-5xl md:text-8xl font-black tracking-widest animate-brand-reveal"
            style={{ color: 'oklch(0.65 0.22 30)' }}
          >
            ZAILONSOFT
          </h1>
          <div className="mt-4 h-px mx-auto animate-expand-line" style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.65 0.22 30), transparent)',
            maxWidth: '300px',
          }} />
          <p className="mt-6 text-xs md:text-sm tracking-[0.3em] uppercase animate-fade-up" style={{
            color: 'oklch(0.5 0.01 250)',
            animationDelay: '0.8s',
            animationFillMode: 'both',
          }}>
            Engenharia Digital de Alta Performance
          </p>
        </div>
      )}
    </div>
  );
}
