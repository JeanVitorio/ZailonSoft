import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { SpaceField } from "@/components/SpaceField";
import { Scene } from "@/components/Scene";
import { FallIndicator } from "@/components/FallIndicator";
import { Marquee } from "@/components/Marquee";
import jeanPortrait from "@/assets/jean.jpg";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.4]);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroBlur = useTransform(heroProgress, [0, 1], ["blur(0px)", "blur(8px)"]);

  const scrollToCta = () => {
    document.getElementById("clima-final")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Fundo cósmico contínuo */}
      <SpaceField />

      {/* Vinheta global */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(240 20% 1% / 0.85) 100%)",
        }}
      />

      {/* Scan-line cinematográfica */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.04] mix-blend-overlay bg-noise"
      />

      <FallIndicator />

      {/* TOP NAV minimal */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse-glow rounded-full bg-primary" />
          <span className="font-display text-sm uppercase tracking-[0.3em] text-foreground">
            Zailon<span className="text-primary">soft</span>
          </span>
        </div>
        <button
          onClick={scrollToCta}
          className="hidden items-center gap-2 border border-border/60 px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-foreground transition-all hover:border-primary hover:text-primary md:flex"
        >
          contato <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {/* ============== HERO — IMPACTO ============== */}
      <section
        ref={heroRef}
        className="relative z-10 flex min-h-[110vh] items-center justify-center px-6"
      >
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity, filter: heroBlur }}
          className="relative mx-auto max-w-7xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-display text-[10px] uppercase tracking-[0.4em] text-primary">
              entre — a queda começou
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[18vw] leading-[0.85] tracking-tighter md:text-[14vw] lg:text-[12rem]"
          >
            SITES E
            <br />
            SISTEMAS
            <br />
            <span className="relative inline-block">
              <span className="text-primary glow-orange">QUE VENDEM.</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-2 left-0 h-1 w-full origin-left bg-primary"
              />
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="mt-12 flex flex-col items-center gap-6"
          >
            <button
              onClick={scrollToCta}
              className="group relative overflow-hidden bg-primary px-10 py-5 font-display text-sm uppercase tracking-[0.3em] text-primary-foreground transition-all hover:shadow-orange"
            >
              <span className="relative z-10 flex items-center gap-3">
                Quero vender mais
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-foreground transition-transform duration-500 group-hover:translate-x-0" />
              <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-background opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                Quero vender mais <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-8 font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
            >
              ↓ caia mais fundo
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============== 1. IMPACTO ============== */}
      <Scene>
        <div className="text-center">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
            01 — diagnóstico
          </p>
          <h2 className="font-display text-5xl leading-[0.95] md:text-8xl lg:text-[10rem]">
            Você já fez<br />
            um <span className="text-stroke-orange">site.</span>
          </h2>
          <p className="mx-auto mt-12 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            Mas ele <span className="text-foreground">não gera resultado.</span>
          </p>
        </div>
      </Scene>

      {/* ============== 2. QUEBRA DE CRENÇA ============== */}
      <Scene>
        <div className="text-center">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
            02 — verdade
          </p>
          <h2 className="font-display text-6xl leading-none md:text-9xl lg:text-[12rem]">
            Sites <span className="text-stroke">bonitos</span>
            <br />
            <span className="text-primary glow-orange">não vendem.</span>
          </h2>
        </div>
      </Scene>

      <Marquee
        items={[
          "Estratégia",
          "Performance",
          "Conversão",
          "Sob medida",
          "Velocidade",
          "Resultado",
        ]}
      />

      {/* ============== 3. PROBLEMA INVISÍVEL ============== */}
      <Scene>
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
              03 — problema invisível
            </p>
            <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">
              Empresas perdem<br />
              <span className="text-primary">dinheiro</span><br />
              todos os dias.
            </h2>
          </div>
          <div className="flex items-end md:col-span-7">
            <div className="space-y-6">
              <p className="text-2xl text-foreground md:text-3xl">
                Por terem presença digital mal construída.
              </p>
              <p className="text-lg text-muted-foreground">
                Sem perceber. Sem alarme. Sem aviso.
                <br />
                <span className="text-foreground">
                  Apenas o silêncio de um caixa que não cresce.
                </span>
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                {[
                  { n: "73%", t: "abandonam em 3s" },
                  { n: "1 em 50", t: "convertem" },
                  { n: "0", t: "alarme dispara" },
                ].map((s) => (
                  <div key={s.n}>
                    <div className="font-display text-3xl text-primary md:text-4xl">{s.n}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {s.t}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Scene>

      {/* ============== 4. TENSÃO ============== */}
      <Scene>
        <div className="space-y-8 text-center">
          <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
            04 — o ciclo
          </p>
          {[
            { t: "Visitantes entram.", d: 0 },
            { t: "Não entendem.", d: 0.15 },
            { t: "Saem.", d: 0.3 },
            { t: "E você nem sabe por quê.", d: 0.45, accent: true },
          ].map((line, i) => (
            <motion.h3
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, delay: line.d }}
              className={`font-display text-4xl leading-tight md:text-7xl ${
                line.accent ? "text-primary glow-orange" : "text-foreground"
              }`}
            >
              {line.t}
            </motion.h3>
          ))}
        </div>
      </Scene>

      {/* ============== 5. REVELAÇÃO ============== */}
      <Scene>
        <div className="relative text-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-radial-orange opacity-60 blur-3xl"
          />
          <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
            05 — revelação
          </p>
          <h2 className="font-display text-5xl leading-[0.9] md:text-8xl lg:text-9xl">
            Conversão não é
            <br />
            <span className="text-stroke">design.</span>
          </h2>
          <h2 className="mt-6 font-display text-6xl leading-[0.9] md:text-9xl lg:text-[10rem]">
            <span className="text-primary glow-orange">É estratégia.</span>
          </h2>
        </div>
      </Scene>

      {/* ============== 6. ZAILONSOFT SURGE ============== */}
      <Scene>
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="font-display text-xs uppercase tracking-[0.5em] text-primary">
              06 — solução
            </div>
            <div className="mt-4 font-display text-7xl leading-none text-foreground md:text-9xl">
              Z<span className="text-primary">/</span>
            </div>
            <div className="mt-2 font-display text-2xl uppercase tracking-[0.2em]">
              Zailonsoft
            </div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-4xl leading-[1] md:text-7xl">
              Criamos sites e sistemas
              <br />
              <span className="text-primary">sob medida.</span>
              <br />
              Pensados para vender.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { t: "Sites", d: "Páginas que convertem visitas em receita." },
                { t: "Sistemas", d: "Plataformas internas que escalam operações." },
                { t: "Estratégia", d: "Cada pixel responde a um objetivo." },
              ].map((b) => (
                <div
                  key={b.t}
                  className="border border-border/60 bg-card/40 p-6 backdrop-blur-sm transition-colors hover:border-primary/60"
                >
                  <div className="font-display text-2xl text-foreground">{b.t}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Scene>

      {/* ============== AUTORIDADE — JEAN ============== */}
      <Scene>
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative overflow-hidden border border-border/60">
              <img
                src={jeanPortrait}
                alt="Jean — desenvolvedor e estrategista da Zailonsoft"
                width={1024}
                height={1024}
                loading="lazy"
                className="aspect-square w-full object-cover grayscale-[20%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-[0.3em] text-foreground">
                  Jean
                </span>
                <span className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
                  fundador
                </span>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
              07 — quem está por trás
            </p>
            <h2 className="font-display text-4xl leading-[1] md:text-6xl">
              Jean não entrega sites.
              <br />
              <span className="text-primary glow-orange">
                Ele constrói máquinas de conversão.
              </span>
            </h2>
            <div className="mt-10 space-y-4 text-lg text-muted-foreground">
              <p>
                <span className="text-foreground">+ 8 anos</span> estudando
                desenvolvimento.
              </p>
              <p>
                <span className="text-foreground">4 anos</span> de atuação prática
                em projetos reais.
              </p>
              <p>
                Experiência sólida com diferentes segmentos — do varejo à
                indústria.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-border pt-6">
              <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                construído com
              </span>
              <span className="font-display text-xl uppercase tracking-wider text-foreground">
                Munters
              </span>
              <span className="text-border">/</span>
              <span className="font-display text-xl uppercase tracking-wider text-foreground">
                Bradesco Seguros
              </span>
            </div>
          </div>
        </div>
      </Scene>

      {/* ============== PROJETOS — Problema → Solução → Resultado ============== */}
      <Scene>
        <div>
          <p className="mb-6 font-display text-xs uppercase tracking-[0.5em] text-primary">
            08 — provas reais
          </p>
          <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
            Nada de portfólio.<br />
            <span className="text-primary">Apenas resultado.</span>
          </h2>
          <div className="mt-12 space-y-px overflow-hidden border border-border/60">
            {[
              {
                problema: "E-commerce sem conversão",
                solucao: "Reestruturação estratégica de funil",
                resultado: "+312% em vendas mensais",
              },
              {
                problema: "Sistema interno lento e travado",
                solucao: "Reescrita completa em arquitetura moderna",
                resultado: "−87% no tempo de operação",
              },
              {
                problema: "Site institucional sem leads",
                solucao: "Landing focada em ação + automação",
                resultado: "8 leads/dia em 30 dias",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group grid gap-4 bg-card/30 p-6 backdrop-blur-sm transition-colors hover:bg-card/60 md:grid-cols-12 md:p-8"
              >
                <div className="md:col-span-1">
                  <span className="font-display text-2xl text-primary">
                    0{i + 1}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <div className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Problema
                  </div>
                  <div className="mt-1 text-lg text-foreground">{c.problema}</div>
                </div>
                <div className="md:col-span-4">
                  <div className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Solução
                  </div>
                  <div className="mt-1 text-lg text-foreground">{c.solucao}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
                    Resultado
                  </div>
                  <div className="mt-1 font-display text-2xl text-primary glow-orange">
                    {c.resultado}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Scene>

      {/* ============== CLÍMAX — A QUEDA ACELERA ============== */}
      <ClimaxBuildup />

      {/* ============== CTA FINAL ============== */}
      <section
        id="clima-final"
        className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-radial-orange opacity-70 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <p className="mb-8 font-display text-xs uppercase tracking-[0.5em] text-primary">
            ◆ controle total ◆
          </p>
          <h2 className="font-display text-5xl leading-[0.9] md:text-8xl lg:text-9xl">
            Se o seu site
            <br />
            <span className="text-stroke">não vende,</span>
            <br />
            <span className="text-primary glow-orange">
              você já sabe o problema.
            </span>
          </h2>

          <div className="mt-16 flex flex-col items-center gap-6">
            <a
              href="https://wa.me/?text=Quero%20um%20site%20que%20vende"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-primary px-12 py-6 font-display text-base uppercase tracking-[0.3em] text-primary-foreground shadow-orange transition-all hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center gap-4">
                Quero um site que vende
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-foreground transition-transform duration-500 group-hover:translate-x-0" />
              <span className="absolute inset-0 z-10 flex items-center justify-center gap-4 text-background opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                Quero um site que vende <ArrowRight className="h-5 w-5" />
              </span>
            </a>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Vagas limitadas. Cada projeto é construído com atenção total ao
              resultado.
            </p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border/40 bg-background/60 px-6 py-12 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-display text-sm uppercase tracking-[0.3em]">
              Zailon<span className="text-primary">soft</span>
            </span>
          </div>
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            sites e sistemas que vendem © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

/** ClimaxBuildup — aceleração visual antes do CTA final. */
const ClimaxBuildup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.6]);
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const y = useTransform(scrollYProgress, [0, 1], [200, -200]);

  return (
    <section
      ref={ref}
      className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      <motion.div
        style={{ scale, rotate: rot, y }}
        className="text-center"
      >
        <div className="font-display text-[20vw] leading-[0.8] text-primary glow-orange md:text-[14rem]">
          ZAILON
          <br />
          <span className="text-stroke-orange">SOFT.</span>
        </div>
      </motion.div>

      {/* linhas aceleradas */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 0.6, 0] }}
            viewport={{ once: false }}
            transition={{ duration: 1.5, delay: i * 0.08, repeat: Infinity }}
            style={{
              left: `${(i / 12) * 100}%`,
              height: `${30 + (i % 4) * 20}%`,
            }}
            className="absolute top-0 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent"
          />
        ))}
      </div>
    </section>
  );
};

export default Index;
