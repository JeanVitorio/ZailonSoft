import { ScrollReveal } from './ScrollReveal';

const PROBLEMS = [
  { number: '01', title: 'Sites bonitos não vendem.', description: 'Design sem estratégia é decoração. Seu site pode ser lindo e mesmo assim não converter um único lead.' },
  { number: '02', title: 'Você está perdendo dinheiro agora.', description: 'Neste exato momento, seu concorrente está recebendo o cliente que deveria ser seu porque ele investiu em presença digital estratégica.' },
  { number: '03', title: 'Presença digital não é ter site.', description: 'É ter uma máquina automatizada que trabalha 24 horas por dia convertendo visitantes em clientes pagantes.' },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            A verdade que ninguém conta
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-14 sm:mb-24">
            O problema não é<br />
            <span className="text-gradient-ember">falta de site.</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-6 sm:space-y-10">
          {PROBLEMS.map((p, i) => (
            <ScrollReveal key={i} delay={i * 200} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="glass-card-v2 p-6 sm:p-8 md:p-12 rounded-xl flex flex-col sm:flex-row gap-4 sm:gap-8 items-start overflow-hidden">
                <span className="text-6xl sm:text-7xl md:text-9xl font-black shrink-0 leading-none"
                  style={{ color: 'oklch(0.65 0.22 30 / 0.2)' }}>
                  {p.number}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl md:text-4xl font-black mb-2 sm:mb-4 text-foreground">{p.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-steel">{p.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
