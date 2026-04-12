import { ScrollReveal } from './ScrollReveal';
import { Instagram, MessageCircle, Zap } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163505?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';
const INSTA_JEAN = 'https://www.instagram.com/jeandeveloper';
const INSTA_ZAILON = 'https://www.instagram.com/zailonsoft';

export function ClimaxSection() {
  return (
    <section className="relative py-32 sm:py-44 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <ScrollReveal>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-glow"
            style={{ background: 'oklch(0.65 0.22 30 / 0.15)', border: '2px solid oklch(0.65 0.22 30 / 0.3)' }}>
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-ember" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-[0.82] mb-6 sm:mb-8 tracking-tighter">
            CHEGOU A<br />
            <span className="text-gradient-ember">SUA VEZ.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="text-lg sm:text-xl md:text-2xl max-w-xl mx-auto mb-10 sm:mb-14 px-2 text-foreground leading-relaxed font-medium">
            Você desceu até aqui por um motivo. Agora é hora de transformar
            sua presença digital em uma <strong className="text-gradient-ember">máquina de resultados</strong>.
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
              <MessageCircle className="w-6 h-6" />
              <span className="hero-cta-shine" />
              FALAR COM JEAN AGORA
            </a>
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
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
          <p className="mt-8 sm:mt-10 text-xs sm:text-sm tracking-[0.2em] uppercase text-white font-semibold px-4 py-2 bg-black/15 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            Atendimento exclusivo · Resposta em até 24h
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
