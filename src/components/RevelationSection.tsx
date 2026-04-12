import { ScrollReveal } from './ScrollReveal';
import jeanHero from '@/assets/jean-hero.jpg';

const WA_LINK = 'https://wa.me/5546991163505?text=Ol%C3%A1%20Jean%2C%20vim%20pelo%20site%20e%20quero%20saber%20mais!';

const STATS = [
  { value: '8+', label: 'Anos de estudo' },
  { value: '4+', label: 'Anos atuando' },
  { value: '50+', label: 'Projetos entregues' },
];

const CLIENTS = ['Munters', 'Bradesco Seguros'];

export function RevelationSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 font-semibold" style={{ color: 'var(--ember)' }}>
            A solução lógica
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-12 sm:mb-20">
            E se existisse alguém que<br />
            <span className="text-gradient-ember">domina o jogo?</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative max-w-md mx-auto md:mx-0">
              <div className="absolute -inset-1 rounded-lg opacity-30" style={{
                background: 'linear-gradient(135deg, var(--ember), transparent)',
              }} />
              <img
                src={jeanHero}
                alt="Jean - Desenvolvedor e Fundador da ZailonSoft"
                className="relative w-full rounded-lg object-cover aspect-square"
                loading="lazy"
                width={768}
                height={768}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 rounded-b-lg"
                style={{ background: 'linear-gradient(to top, oklch(0.02 0.003 250), transparent)' }}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black">Jean</p>
                <p className="text-xs sm:text-sm tracking-widest uppercase mt-1" style={{ color: 'var(--ember)' }}>
                  ZailonSoft · Fundador
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-6 sm:space-y-8">
            <ScrollReveal direction="right">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ash-light)' }}>
                Mais de <strong className="text-foreground">8 anos estudando desenvolvimento</strong> e
                <strong className="text-foreground"> 4 anos atuando profissionalmente</strong> com projetos reais,
                entregando soluções que geram resultado de verdade.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ash-light)' }}>
                Experiência com empresas de alto nível — de multinacionais a grandes seguradoras —
                sempre com foco em <strong className="text-foreground">performance, conversão e clareza</strong>.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ash-light)' }}>
                Especialista em <strong className="text-foreground">Sites, Landing Pages e Soluções Web Personalizadas</strong> — 
                cada projeto é único, feito sob medida para maximizar seus resultados.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <div className="flex flex-wrap gap-3">
                {CLIENTS.map(c => (
                  <span key={c} className="glass-card-v2 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-lg">
                    {c}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={400}>
              <div className="flex flex-wrap gap-6 sm:gap-8 md:gap-12 pt-2 sm:pt-4">
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-gradient-ember">{s.value}</p>
                    <p className="text-[10px] sm:text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--ash)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={500}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta-button inline-block mt-4">
                <span className="hero-cta-shine" />
                FALAR COM JEAN
              </a>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
