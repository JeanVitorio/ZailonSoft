import { ScrollReveal } from './ScrollReveal';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-sm md:text-base tracking-[0.4em] uppercase mb-6" style={{ color: 'var(--ash-light)' }}>
            Seu negócio merece mais do que presença digital
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black leading-[0.9] tracking-tight">
            RESULTADOS.<br />
            <span className="text-gradient-ember">NÃO SITES.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="mt-8 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--ash-light)' }}>
            Enquanto você procura alguém pra fazer um site bonito,
            seus concorrentes estão construindo <strong className="text-foreground">máquinas de conversão</strong>.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button inline-block mt-12 rounded-sm"
          >
            QUERO RESULTADOS REAIS
          </a>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--ash)' }}>Desça</span>
        <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, var(--ash), transparent)' }} />
      </div>
    </section>
  );
}
