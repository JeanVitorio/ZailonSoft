import { ScrollReveal } from './ScrollReveal';
import { Clock, TrendingDown, AlertTriangle } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163505?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';

const URGENCY_POINTS = [
  {
    icon: Clock,
    stat: '8 seg',
    label: 'é o tempo que o visitante leva pra decidir se fica ou sai do seu site',
  },
  {
    icon: TrendingDown,
    stat: '79%',
    label: 'dos visitantes que não convertem nunca mais voltam',
  },
  {
    icon: AlertTriangle,
    stat: 'R$0',
    label: 'é o que um site sem estratégia gera de retorno por mês',
  },
];

export function UrgencySection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            A conta não fecha
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-14 sm:mb-20">
            Cada dia sem agir é<br />
            <span className="text-gradient-ember">dinheiro que fica na mesa.</span>
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-14 sm:mb-16">
          {URGENCY_POINTS.map((u, i) => (
            <ScrollReveal key={u.stat} delay={250 + i * 150}>
              <div className="glass-card-v2 p-6 sm:p-8 rounded-xl text-center group hover:border-ember/25 transition-all duration-500">
                <u.icon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 text-ember" />
                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-gradient-ember mb-3">{u.stat}</p>
                <p className="text-sm sm:text-base leading-relaxed text-steel">{u.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={700}>
          <div className="text-center">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta-button hero-cta-lg inline-flex">
              <span className="hero-cta-shine" />
              PARAR DE PERDER DINHEIRO
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
