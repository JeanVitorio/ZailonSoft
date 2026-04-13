import { ScrollReveal } from './ScrollReveal';
import { Dumbbell, Stethoscope, Car, ArrowRight } from 'lucide-react';

const WA_LINK = 'https://wa.me/5546991163405?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';

const NICHES = [
  {
    icon: Dumbbell,
    niche: 'Academias',
    title: 'Sua academia está invisível na internet?',
    problem: 'A maioria das academias depende de indicação boca a boca e perde alunos para concorrentes com presença digital forte. Sem uma landing page estratégica, todo investimento em tráfego pago é desperdiçado.',
    solution: 'Uma Landing Page de alta conversão com copy persuasivo, prova social, e funil de captação de leads que transforma visitantes em alunos matriculados 24 horas por dia.',
    cta: 'QUERO LOTAR MINHA ACADEMIA',
  },
  {
    icon: Stethoscope,
    niche: 'Clínicas Veterinárias',
    title: 'Seus clientes estão escolhendo o concorrente.',
    problem: 'Clínicas veterinárias sem site profissional perdem credibilidade. Tutores pesquisam no Google antes de escolher e se sua clínica não aparece, outra aparece no seu lugar.',
    solution: 'Um site institucional completo com agendamento online, depoimentos de clientes, e SEO otimizado para aparecer nas buscas locais gerando confiança antes mesmo da primeira consulta.',
    cta: 'QUERO MAIS CLIENTES NA MINHA CLÍNICA',
  },
  {
    icon: Car,
    niche: 'Lojas de Veículos',
    title: 'Estoque parado é prejuízo todo dia.',
    problem: 'Lojas de veículos que não têm uma presença digital estratégica dependem apenas de quem passa na frente. O estoque gira devagar, os custos sobem, e os leads esfriam.',
    solution: 'Uma plataforma web personalizada com catálogo interativo, filtros inteligentes, integração com WhatsApp e landing pages para cada promoção transformando visualizações em visitas reais.',
    cta: 'QUERO VENDER MAIS VEÍCULOS',
  },
];

export function ProjectsSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            Nichos que dominamos
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-6 sm:mb-8">
            Soluções que<br />
            <span className="text-gradient-ember">geram resultado.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mb-16 sm:mb-24 text-foreground/95 leading-relaxed bg-black/15 backdrop-blur-xl rounded-[2rem] px-6 py-5 inline-block shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            Não importa o seu nicho se você precisa de clientes, nós construímos
            a máquina que vai trazê-los até você.
          </p>
        </ScrollReveal>

        <div className="space-y-8 sm:space-y-12">
          {NICHES.map((n, i) => (
            <ScrollReveal key={i} delay={i * 200}>
              <div className="glass-card-v2 rounded-xl overflow-hidden group hover:border-ember/30 transition-all duration-500">
                <div className="p-6 sm:p-8 md:p-12">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'oklch(0.65 0.22 30 / 0.15)', border: '1px solid oklch(0.65 0.22 30 / 0.25)' }}>
                      <n.icon className="w-6 h-6 sm:w-7 sm:h-7 text-ember" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold text-ember">{n.niche}</p>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-tight">{n.title}</h3>
                    </div>
                  </div>

                  {/* Problem & Solution */}
                  <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
                    <div className="p-4 sm:p-6 rounded-lg" style={{ background: 'oklch(0.12 0.01 250 / 0.8)', border: '1px solid oklch(1 0 0 / 0.05)' }}>
                      <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-2 sm:mb-3 font-bold" style={{ color: 'oklch(0.7 0.2 0)' }}>⚠ O Problema</p>
                      <p className="text-sm sm:text-base leading-relaxed text-steel">{n.problem}</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-lg" style={{ background: 'oklch(0.65 0.22 30 / 0.06)', border: '1px solid oklch(0.65 0.22 30 / 0.15)' }}>
                      <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-2 sm:mb-3 font-bold text-ember">✦ A Solução</p>
                      <p className="text-sm sm:text-base leading-relaxed text-steel">{n.solution}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-cta-button inline-flex items-center gap-3 group-hover:shadow-[0_4px_30px_oklch(0.65_0.22_30/0.4)]"
                  >
                    <span className="hero-cta-shine" />
                    {n.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
