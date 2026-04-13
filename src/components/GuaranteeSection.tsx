import { ScrollReveal } from './ScrollReveal';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163405?text=Ol%C3%A1%20Jean%2C%20quero%20saber%20mais%20sobre%20a%20garantia!';

export function GuaranteeSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="glass-card-v2 p-8 sm:p-12 md:p-16 rounded-2xl text-center relative overflow-hidden group hover:border-ember/25 transition-all duration-500">
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(circle at 50% 30%, oklch(0.65 0.22 30 / 0.4), transparent 70%)' }} />
            
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-8"
                style={{ background: 'oklch(0.65 0.22 30 / 0.12)', border: '2px solid oklch(0.65 0.22 30 / 0.3)' }}>
                <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 text-ember" />
              </div>
              
              <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-4 font-bold text-ember">
                Compromisso ZailonSoft
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[0.85] mb-6">
                Sua satisfação é<br />
                <span className="text-gradient-ember">minha prioridade.</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-steel leading-relaxed">
                Eu não entrego projetos eu entrego resultados. Cada etapa é validada
                por você, com revisões ilimitadas durante o desenvolvimento. Se não superar
                suas expectativas, <strong className="text-foreground font-black">eu ajusto até superar</strong>.
              </p>

              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="hero-cta-button inline-flex items-center gap-3">
                <span className="hero-cta-shine" />
                QUERO MINHA SOLUÇÃO SOB MEDIDA
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
