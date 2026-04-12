import { ScrollReveal } from './ScrollReveal';
import { Instagram } from 'lucide-react';

const WA_NUMBER = '5546991163505';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!`;
const INSTA_JEAN = 'https://www.instagram.com/jeandeveloper';
const INSTA_ZAILON = 'https://www.instagram.com/zailonsoft';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="max-w-5xl mx-auto text-center w-full">
        <ScrollReveal>
          <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 font-medium" style={{ color: 'var(--ash-light)' }}>
            Seu negócio merece mais do que presença digital
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black leading-[0.85] tracking-tight">
            RESULTADOS.<br />
            <span className="text-gradient-ember">NÃO SITES.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2" style={{ color: 'var(--ash-light)' }}>
            Enquanto você procura alguém pra fazer um site bonito,
            seus concorrentes estão construindo <strong className="text-foreground">máquinas de conversão</strong>.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 sm:mt-12">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-button w-full sm:w-auto"
            >
              <span className="hero-cta-shine" />
              QUERO RESULTADOS REAIS
            </a>
            <div className="flex gap-3">
              <a href={INSTA_JEAN} target="_blank" rel="noopener noreferrer"
                className="social-icon-button" aria-label="Instagram Jean">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={INSTA_ZAILON} target="_blank" rel="noopener noreferrer"
                className="social-icon-button" aria-label="Instagram ZailonSoft">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>Desça</span>
        <div className="w-px h-8 sm:h-10" style={{ background: 'linear-gradient(to bottom, var(--ash), transparent)' }} />
      </div>
    </section>
  );
}
