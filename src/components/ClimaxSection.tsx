import { ScrollReveal } from './ScrollReveal';

export function ClimaxSection() {
  return (
    <section className="relative py-40 px-6">
      {/* Intensifying glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center bottom, oklch(0.65 0.22 30 / 0.08), transparent 70%)',
      }} />

      <div className="max-w-4xl mx-auto text-center relative">
        <ScrollReveal>
          <p className="text-sm tracking-[0.4em] uppercase mb-6" style={{ color: 'var(--ember)' }}>
            Decisão
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.9] mb-8">
            PARE DE<br />
            <span className="text-gradient-ember">PERDER TEMPO.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-12" style={{ color: 'var(--ash-light)' }}>
            Cada dia sem uma presença digital estratégica é um dia que você perde clientes
            para quem já entendeu o jogo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button inline-block rounded-sm animate-pulse-glow text-lg md:text-xl px-10 py-5"
          >
            FALAR COM JEAN AGORA
          </a>
        </ScrollReveal>

        <ScrollReveal delay={800}>
          <p className="mt-8 text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>
            Sem compromisso · Resposta em até 24h
          </p>
        </ScrollReveal>
      </div>

      {/* Bottom fade to black */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--void-deep))' }} />
    </section>
  );
}
