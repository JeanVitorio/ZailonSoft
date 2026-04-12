import { ScrollReveal } from './ScrollReveal';

const PROBLEMS = [
  { number: '01', title: 'Sites bonitos não vendem.', description: 'Design sem estratégia é decoração. Seu site pode ser lindo e mesmo assim não gerar nenhuma venda.' },
  { number: '02', title: 'Você está perdendo dinheiro.', description: 'Cada dia sem uma presença digital estratégica é dinheiro que seu concorrente está ganhando no seu lugar.' },
  { number: '03', title: 'Presença digital não é ter site.', description: 'É ter uma máquina que trabalha 24h convertendo visitantes em clientes reais.' },
];

export function ProblemSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 font-semibold" style={{ color: 'var(--ember)' }}>
            A verdade que ninguém conta
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-12 sm:mb-20">
            O problema não é<br />
            <span className="text-gradient-ember">falta de site.</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-8 sm:space-y-16">
          {PROBLEMS.map((p, i) => (
            <ScrollReveal key={i} delay={i * 200} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="glass-card-v2 p-6 sm:p-8 md:p-12 rounded-lg flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 items-start overflow-hidden">
                <span className="text-5xl sm:text-6xl md:text-8xl font-black shrink-0" style={{ color: 'oklch(0.65 0.22 30 / 0.15)' }}>
                  {p.number}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">{p.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: 'var(--ash-light)' }}>{p.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
