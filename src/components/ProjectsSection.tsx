import { ScrollReveal } from './ScrollReveal';
import projectGym from '@/assets/project-gym.jpg';
import projectEnterprise from '@/assets/project-enterprise.jpg';

const PROJECTS = [
  {
    image: projectGym,
    tag: 'Fitness & Performance',
    title: 'Plataforma de alta conversão para academias',
    problem: 'Academias perdendo alunos por falta de presença digital estratégica.',
    solution: 'Sistema completo de captação com landing pages otimizadas e funil de conversão.',
    result: '+340% de leads qualificados em 60 dias.',
  },
  {
    image: projectEnterprise,
    tag: 'Enterprise',
    title: 'Dashboard corporativo de gestão',
    problem: 'Processos manuais gerando atraso e perda de dados.',
    solution: 'Painel inteligente com automação e visualização em tempo real.',
    result: '80% menos tempo em processos operacionais.',
  },
];

export function ProjectsSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-sm tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--ember)' }}>
            Prova real
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-20">
            Projetos que<br />
            <span className="text-gradient-ember">geram resultado.</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-24">
          {PROJECTS.map((p, i) => (
            <ScrollReveal key={i} delay={i * 200}>
              <div className="glass-card rounded-sm overflow-hidden">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                    width={1280}
                    height={720}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-sm"
                      style={{ background: 'var(--ember)', color: 'var(--ember-foreground)' }}>
                      {p.tag}
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-12">
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">{p.title}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--ember)' }}>Problema</p>
                      <p className="text-sm" style={{ color: 'var(--ash-light)' }}>{p.problem}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--ember)' }}>Solução</p>
                      <p className="text-sm" style={{ color: 'var(--ash-light)' }}>{p.solution}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--ember)' }}>Resultado</p>
                      <p className="text-lg font-bold text-foreground">{p.result}</p>
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
