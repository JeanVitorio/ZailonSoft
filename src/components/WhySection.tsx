import { ScrollReveal } from './ScrollReveal';
import { Target, Zap, Shield } from 'lucide-react';

const PILLARS = [
  {
    icon: Target,
    title: 'PORQUÊ',
    subtitle: 'A crença',
    text: 'Acredito que toda empresa merece uma presença digital que trabalhe por ela — 24 horas, 7 dias por semana. Não é sobre ter um site. É sobre ter uma máquina de resultados.',
  },
  {
    icon: Zap,
    title: 'COMO',
    subtitle: 'O método',
    text: 'Combino design de alto impacto, copywriting persuasivo e engenharia de performance para criar experiências que não apenas impressionam — convertem.',
  },
  {
    icon: Shield,
    title: 'O QUÊ',
    subtitle: 'A entrega',
    text: 'Sites institucionais, Landing Pages de alta conversão e Soluções Web sob medida. Cada projeto é único, construído para maximizar o resultado do SEU negócio.',
  },
];

export function WhySection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            O círculo dourado
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-6 sm:mb-8">
            Não começo pelo <em className="not-italic text-steel">o quê.</em><br />
            <span className="text-gradient-ember">Começo pelo porquê.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mb-16 sm:mb-24 text-steel leading-relaxed">
            As marcas mais poderosas do mundo não vendem produtos — vendem propósitos.
            A ZailonSoft opera no mesmo princípio.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {PILLARS.map((p, i) => (
            <ScrollReveal key={p.title} delay={300 + i * 200}>
              <div className="glass-card-v2 p-6 sm:p-8 md:p-10 rounded-xl h-full flex flex-col group hover:border-ember/25 transition-all duration-500">
                <div className="mb-5 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_oklch(0.65_0.22_30/0.3)]"
                    style={{ background: 'oklch(0.65 0.22 30 / 0.12)', border: '1px solid oklch(0.65 0.22 30 / 0.25)' }}>
                    <p.icon className="w-6 h-6 sm:w-7 sm:h-7 text-ember" />
                  </div>
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-1 text-ember">
                    {p.subtitle}
                  </p>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">{p.title}</h3>
                </div>
                <p className="text-sm sm:text-base leading-relaxed flex-1 text-steel">
                  {p.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
