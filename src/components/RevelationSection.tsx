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
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            Quem está por trás
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-14 sm:mb-24">
            E se existisse alguém que<br />
            <span className="text-gradient-ember">domina o jogo?</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative max-w-md mx-auto md:mx-0">
              <div className="absolute -inset-2 rounded-2xl opacity-40"
                style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 30 / 0.5), transparent 70%)' }} />
              <img
                src={jeanHero}
                alt="Jean - Desenvolvedor e Fundador da ZailonSoft"
                className="relative w-full rounded-2xl object-cover object-[center_25%] aspect-square shadow-2xl"
                loading="lazy"
                width={768}
                height={768}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 rounded-b-2xl"
                style={{ background: 'linear-gradient(to top, oklch(0.02 0.003 250), oklch(0.02 0.003 250 / 0.8) 50%, transparent)' }}>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">Jean</p>
                <p className="text-xs sm:text-sm tracking-[0.2em] uppercase mt-1 text-ember font-bold">
                  ZailonSoft · Fundador
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-6 sm:space-y-8">
            <ScrollReveal direction="right">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-steel">
                Mais de <strong className="text-foreground font-black">8 anos estudando desenvolvimento</strong> e
                <strong className="text-foreground font-black"> 4 anos atuando profissionalmente</strong> com projetos reais,
                entregando soluções que geram resultado de verdade.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-steel">
                Experiência com empresas de alto nível de multinacionais a grandes seguradoras
                sempre com foco em <strong className="text-foreground font-black">performance, conversão e excelência</strong>.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-steel">
                Especialista em <strong className="text-foreground font-black">Sites, Landing Pages e Soluções Web Personalizadas </strong>  
                cada projeto é único, feito sob medida para maximizar seus resultados.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <div className="flex flex-wrap gap-3">
                {CLIENTS.map(c => (
                  <span key={c} className="glass-card-v2 px-5 sm:px-6 py-3 text-sm sm:text-base font-bold tracking-wider uppercase rounded-xl text-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={400}>
              <div className="flex flex-wrap gap-8 sm:gap-12 pt-4">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient-ember">{s.value}</p>
                    <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-1 text-ash-light font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={500}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta-button inline-flex mt-4">
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
