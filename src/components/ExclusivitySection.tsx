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
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 font-semibold" style={{ color: 'var(--ember)' }}>
            Exclusividade real
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6 sm:mb-8">
            Não é para<br />
            <span className="text-gradient-ember">todo mundo.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12 sm:mb-16" style={{ color: 'var(--ash-light)' }}>
            Trabalho com um número limitado de clientes por mês para garantir
            que cada projeto receba o nível de atenção que merece.
            Se você está lendo isso, uma vaga pode estar disponível.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {EXCLUSIVITY.map((e, i) => (
            <ScrollReveal key={e.text} delay={350 + i * 100}>
              <div className="glass-card-v2 p-5 sm:p-6 rounded-xl flex items-center gap-4 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'oklch(0.65 0.22 30 / 0.1)', border: '1px solid oklch(0.65 0.22 30 / 0.15)' }}>
                  <e.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--ember)' }} />
                </div>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{e.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
