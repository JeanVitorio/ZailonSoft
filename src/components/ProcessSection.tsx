import { ScrollReveal } from './ScrollReveal';

const STEPS = [
  {
    num: '01',
    title: 'Diagnóstico',
    text: 'Entendo seu negócio, seu público e seus objetivos. Sem isso, qualquer solução é um tiro no escuro.',
  },
  {
    num: '02',
    title: 'Estratégia',
    text: 'Defino a arquitetura, o funil de conversão e o posicionamento visual que vai diferenciar você da concorrência.',
  },
  {
    num: '03',
    title: 'Execução',
    text: 'Desenvolvo com obsessão por performance, design e cada detalhe que impacta o resultado final.',
  },
  {
    num: '04',
    title: 'Resultado',
    text: 'Entrego, monitoro e otimizo. Seu projeto não termina no deploy — ele começa a performar.',
  },
];

export function ProcessSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            O processo
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-16 sm:mb-24">
            Do zero ao<br />
            <span className="text-gradient-ember">resultado real.</span>
          </h2>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-5 sm:left-7 md:left-9 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, oklch(0.65 0.22 30), oklch(0.65 0.22 30 / 0.1))' }} />

          <div className="space-y-10 sm:space-y-16">
            {STEPS.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 200}>
                <div className="flex gap-6 sm:gap-8 md:gap-12">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center font-black text-sm sm:text-lg md:text-xl"
                      style={{
                        background: 'oklch(0.65 0.22 30 / 0.12)',
                        border: '2px solid oklch(0.65 0.22 30 / 0.35)',
                        color: 'var(--ember)',
                        boxShadow: '0 0 20px oklch(0.65 0.22 30 / 0.15)',
                      }}>
                      {s.num}
                    </div>
                  </div>
                  <div className="pt-0 sm:pt-1 md:pt-3 min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-4xl font-black mb-2 sm:mb-3 text-foreground">{s.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed text-steel">{s.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
