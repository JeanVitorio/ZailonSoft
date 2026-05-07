import { motion } from "framer-motion";
import { Search, Compass, Code, Rocket } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Search,
    t: "Diagnóstico",
    d: "Entendemos seu negócio, seu cliente e onde está a maior oportunidade de venda.",
  },
  {
    n: "02",
    icon: Compass,
    t: "Estratégia",
    d: "Mapeamos jornada, copy, ofertas e o caminho exato que leva o visitante à conversão.",
  },
  {
    n: "03",
    icon: Code,
    t: "Design + Código",
    d: "Construção sob medida, performance extrema e UX validado a cada decisão.",
  },
  {
    n: "04",
    icon: Rocket,
    t: "Lançamento + Otimização",
    d: "Publicamos, medimos, ajustamos. O projeto continua evoluindo para vender mais.",
  },
];

export const Process = () => {
  return (
    <section id="processo" className="relative py-24 md:py-32">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            ◆ Como trabalhamos
          </span>
          <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">
            Um processo claro,{" "}
            <span className="gradient-text">do briefing ao resultado</span>
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            Sem mistério, sem atraso. Você sabe exatamente onde seu projeto está em cada etapa.
          </p>
        </div>

        <div className="relative mt-20">
          {/* animated connecting line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            aria-hidden
            className="absolute left-6 top-0 hidden h-full w-px origin-top bg-gradient-to-b from-primary via-accent to-primary-deep md:block md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-10 md:space-y-16">
            {steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: right ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative grid items-center gap-6 md:grid-cols-2 ${
                    right ? "md:[&>:first-child]:order-2" : ""
                  }`}
                >
                  {/* card side */}
                  <div className={`md:px-12 ${right ? "md:text-left" : "md:text-right"}`}>
                    <div className="group relative inline-block w-full max-w-md rounded-2xl border border-border/80 bg-gradient-card p-7 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-orange-soft">
                      <div className="flex items-start gap-4">
                        <span className="font-display text-3xl text-primary/80">{s.n}</span>
                        <div className="flex-1">
                          <h3 className="font-display text-2xl text-foreground">{s.t}</h3>
                          <p className="mt-2 text-muted-foreground">{s.d}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* center node */}
                  <div className="absolute left-6 top-8 -translate-x-1/2 md:left-1/2">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-background shadow-orange-soft">
                      <span className="absolute inset-0 animate-pulse-ring rounded-full" />
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* spacer */}
                  <div className="hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
