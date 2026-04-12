import { ScrollReveal } from './ScrollReveal';
import projectGym from '@/assets/project-gym.jpg';
import projectEnterprise from '@/assets/project-enterprise.jpg';

const PROJECTS = [
  {
    image: projectGym,
    tag: 'Landing Page',
    title: 'Landing page de alta conversão para academias',
    problem: 'Academias perdendo alunos por falta de presença digital estratégica.',
    solution: 'Landing page otimizada com funil de conversão e copywriting persuasivo.',
    result: '+340% de leads qualificados em 60 dias.',
  },
  {
    image: projectEnterprise,
    tag: 'Solução Web',
    title: 'Sistema web corporativo de gestão',
    problem: 'Processos manuais gerando atraso e perda de dados.',
    solution: 'Solução web personalizada com automação e painel em tempo real.',
    result: '80% menos tempo em processos operacionais.',
  },
];

export function ProjectsSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 font-semibold" style={{ color: 'var(--ember)' }}>
            Prova real
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-12 sm:mb-20">
            Projetos que<br />
            <span className="text-gradient-ember">geram resultado.</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-12 sm:space-y-24">
          {PROJECTS.map((p, i) => (
            <ScrollReveal key={i} delay={i * 200}>
              <div className="glass-card-v2 rounded-lg overflow-hidden">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-md"
                      style={{ background: 'var(--ember)', color: 'var(--ember-foreground)' }}>
                      {p.tag}
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-8 md:p-12">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">{p.title}</h3>
                  <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <p className="text-[10px] sm:text-xs tracking-widest uppercase mb-1 sm:mb-2 font-semibold" style={{ color: 'var(--ember)' }}>Problema</p>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ash-light)' }}>{p.problem}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs tracking-widest uppercase mb-1 sm:mb-2 font-semibold" style={{ color: 'var(--ember)' }}>Solução</p>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ash-light)' }}>{p.solution}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs tracking-widest uppercase mb-1 sm:mb-2 font-semibold" style={{ color: 'var(--ember)' }}>Resultado</p>
                      <p className="text-sm sm:text-lg font-bold text-foreground">{p.result}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
