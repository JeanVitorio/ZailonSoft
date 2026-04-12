import { ScrollReveal } from './ScrollReveal';
import { Instagram, MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163505?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';
const INSTA_JEAN = 'https://www.instagram.com/jeandeveloper';
const INSTA_ZAILON = 'https://www.instagram.com/zailonsoft';

export function ClimaxSection() {
  return (
    <section className="relative py-28 sm:py-40 px-4 sm:px-6">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center bottom, oklch(0.65 0.22 30 / 0.1), transparent 70%)',
      }} />

      <div className="max-w-4xl mx-auto text-center relative">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 font-semibold" style={{ color: 'var(--ember)' }}>
            Decisão
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] mb-6 sm:mb-8">
            PARE DE<br />
            <span className="text-gradient-ember">PERDER TEMPO.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 sm:mb-12 px-2" style={{ color: 'var(--ash-light)' }}>
            Cada dia sem uma presença digital estratégica é um dia que você perde clientes
            para quem já entendeu o jogo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-button hero-cta-lg animate-pulse-glow w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hero-cta-shine" />
              FALAR COM JEAN AGORA
            </a>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <a href={INSTA_JEAN} target="_blank" rel="noopener noreferrer"
              className="social-icon-button" aria-label="Instagram Jean">
              <Instagram className="w-5 h-5" />
            </a>
            <a href={INSTA_ZAILON} target="_blank" rel="noopener noreferrer"
              className="social-icon-button" aria-label="Instagram ZailonSoft">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={800}>
          <p className="mt-6 sm:mt-8 text-[10px] sm:text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>
            Atendimento exclusivo · Resposta em até 24h
          </p>
        </ScrollReveal>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--void-deep))' }} />
    </section>
  );
}
