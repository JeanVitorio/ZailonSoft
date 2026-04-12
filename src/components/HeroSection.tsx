import { ScrollReveal } from './ScrollReveal';
import { Instagram, MessageCircle, ChevronDown } from 'lucide-react';

const WA_NUMBER = '5546991163505';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!`;
const INSTA_JEAN = 'https://www.instagram.com/jeandeveloper';
const INSTA_ZAILON = 'https://www.instagram.com/zailonsoft';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="max-w-5xl mx-auto text-center w-full">
        <ScrollReveal>
          <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-4 sm:mb-6 font-semibold text-ember">
            Engenharia Digital de Alta Performance
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black leading-[0.82] tracking-tighter">
            <span className="block text-foreground drop-shadow-[0_0_40px_oklch(0.65_0.22_30/0.3)]">RESULTADOS.</span>
            <span className="block text-gradient-ember mt-2">NÃO SITES.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="mt-8 sm:mt-10 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 py-5 text-foreground/95 leading-relaxed rounded-[2rem] bg-black/15 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            Enquanto você procura alguém pra fazer um site bonito,
            seus concorrentes estão construindo <strong className="text-foreground font-bold">máquinas de conversão</strong>.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 sm:mt-14">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-button hero-cta-lg w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5" />
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

      <div className="absolute bottom-32 sm:bottom-40 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium text-foreground/80 bg-black/15 px-3 py-1 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.14)]">Desça</span>
        <ChevronDown className="w-5 h-5 text-ember" />
      </div>
    </section>
  );
}
