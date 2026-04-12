import { ScrollReveal } from './ScrollReveal';
import jeanImg from '@/assets/jean-profile.jpg';

const STATS = [
  { value: '8+', label: 'Anos de estudo' },
  { value: '4+', label: 'Anos atuando' },
  { value: '50+', label: 'Projetos entregues' },
];

const CLIENTS = ['Munters', 'Bradesco Seguros'];

export function RevelationSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-sm tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--ember)' }}>
            A solução lógica
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-20">
            E se existisse alguém que<br />
            <span className="text-gradient-ember">domina o jogo?</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Jean image */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="absolute -inset-1 rounded-sm opacity-30" style={{
                background: 'linear-gradient(135deg, var(--ember), transparent)',
              }} />
              <img
                src={jeanImg}
                alt="Jean - Desenvolvedor"
                className="relative w-full rounded-sm object-cover"
                style={{ maxHeight: '600px' }}
                loading="lazy"
                width={768}
                height={1024}
              />
              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8"
                style={{ background: 'linear-gradient(to top, oklch(0.02 0.003 250), transparent)' }}>
                <p className="text-3xl md:text-4xl font-black">Jean</p>
                <p className="text-sm tracking-widest uppercase mt-1" style={{ color: 'var(--ember)' }}>
                  ZailonSoft · Fundador
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Info */}
          <div className="space-y-8">
            <ScrollReveal direction="right">
              <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ash-light)' }}>
                Mais de <strong className="text-foreground">8 anos estudando desenvolvimento</strong> e
                <strong className="text-foreground"> 4 anos atuando profissionalmente</strong> com projetos reais,
                entregando soluções que geram resultado de verdade.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ash-light)' }}>
                Experiência com empresas de alto nível — de multinacionais a grandes seguradoras —
                sempre com foco em <strong className="text-foreground">performance, conversão e clareza</strong>.
              </p>
            </ScrollReveal>

            {/* Client logos as text */}
            <ScrollReveal direction="right" delay={300}>
              <div className="flex flex-wrap gap-4">
                {CLIENTS.map(c => (
                  <span key={c} className="glass-card px-5 py-3 text-sm font-semibold tracking-wider uppercase rounded-sm">
                    {c}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="right" delay={400}>
              <div className="flex gap-8 md:gap-12 pt-4">
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-gradient-ember">{s.value}</p>
                    <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--ash)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
