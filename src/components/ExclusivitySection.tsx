import { ScrollReveal } from './ScrollReveal';
import { Lock, Users, Star, CheckCircle2 } from 'lucide-react';

const EXCLUSIVITY = [
  { icon: Lock, text: 'Atendimento limitado — poucos projetos por mês' },
  { icon: Users, text: 'Comunicação direta comigo, sem intermediários' },
  { icon: Star, text: 'Cada projeto recebe atenção total e exclusiva' },
  { icon: CheckCircle2, text: 'Suporte e acompanhamento pós-entrega' },
];

export function ExclusivitySection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            Exclusividade real
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-6 sm:mb-8">
            Não é para<br />
            <span className="text-gradient-ember">todo mundo.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-14 sm:mb-16 text-steel leading-relaxed">
            Trabalho com um número limitado de clientes por mês para garantir
            que cada projeto receba o nível de atenção que merece.
            <strong className="text-foreground font-black"> Se você está lendo isso, uma vaga pode estar disponível.</strong>
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {EXCLUSIVITY.map((e, i) => (
            <ScrollReveal key={e.text} delay={350 + i * 100}>
              <div className="glass-card-v2 p-5 sm:p-6 rounded-xl flex items-center gap-4 text-left group hover:border-ember/25 transition-all duration-500">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:shadow-[0_0_25px_oklch(0.65_0.22_30/0.3)]"
                  style={{ background: 'oklch(0.65 0.22 30 / 0.12)', border: '1px solid oklch(0.65 0.22 30 / 0.2)' }}>
                  <e.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ember" />
                </div>
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-foreground">{e.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
