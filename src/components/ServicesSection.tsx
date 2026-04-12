import { ScrollReveal } from './ScrollReveal';
import { Globe, Rocket, Code2, ArrowRight } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163505?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';

const SERVICES = [
  {
    icon: Globe,
    title: 'Sites Institucionais',
    tagline: 'Sua empresa com presença de autoridade',
    points: [
      'Design premium que transmite confiança',
      'Otimizado para Google (SEO avançado)',
      'Responsivo em todos os dispositivos',
      'Carregamento ultra-rápido',
    ],
  },
  {
    icon: Rocket,
    title: 'Landing Pages',
    tagline: 'Páginas que convertem visitantes em clientes',
    points: [
      'Copywriting persuasivo integrado',
      'Funil de conversão estratégico',
      'A/B testing para máximo resultado',
      'Integração com CRM e analytics',
    ],
  },
  {
    icon: Code2,
    title: 'Soluções Web',
    tagline: 'Sistemas sob medida para seu negócio',
    points: [
      'Dashboards e painéis de controle',
      'Automações e integrações',
      'APIs personalizadas',
      'Escalável e seguro',
    ],
  },
];

export function ServicesSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            Arsenal completo
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-6 sm:mb-8">
            Três armas.<br />
            <span className="text-gradient-ember">Um objetivo: resultado.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mb-16 sm:mb-24 text-steel leading-relaxed">
            Cada solução é projetada com um único propósito — gerar retorno real para o seu negócio.
            Sem templates. Sem atalhos. Tudo feito sob medida.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} delay={300 + i * 200}>
              <div className="glass-card-v2 rounded-xl overflow-hidden h-full flex flex-col group hover:border-ember/25 transition-all duration-500">
                <div className="p-6 sm:p-8 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-5 sm:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_oklch(0.65_0.22_30/0.3)]"
                    style={{ background: 'oklch(0.65 0.22 30 / 0.12)', border: '1px solid oklch(0.65 0.22 30 / 0.25)' }}>
                    <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-ember" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 text-foreground">{s.title}</h3>
                  <p className="text-xs sm:text-sm tracking-wide mb-5 sm:mb-6 text-ember font-semibold">{s.tagline}</p>
                  <ul className="space-y-3 sm:space-y-4">
                    {s.points.map(p => (
                      <li key={p} className="flex items-start gap-3 text-sm sm:text-base text-steel">
                        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-ember" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                  <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-bold tracking-wider uppercase transition-all duration-300 group-hover:gap-4 text-ember">
                    Solicitar orçamento
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
