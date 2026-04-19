import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    t: "Diagnóstico",
    d: "Entendemos seu negócio, seu cliente e onde está a maior oportunidade de venda.",
  },
  {
    n: "02",
    t: "Estratégia",
    d: "Mapeamos jornada, copy, ofertas e o caminho exato que leva o visitante à conversão.",
  },
  {
    n: "03",
    t: "Design + Código",
    d: "Construção sob medida, performance extrema e UX validado a cada decisão.",
  },
  {
    n: "04",
    t: "Lançamento + Otimização",
    d: "Publicamos, medimos, ajustamos. O projeto continua evoluindo para vender mais.",
  },
];

export const Process = () => {
  return (
    <section id="processo" className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
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
            Sem mistério, sem atraso. Você sabe exatamente onde seu projeto está
            em cada etapa.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent lg:block"
          />

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-16">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl border border-border bg-gradient-card p-8 shadow-card ${
                  i % 2 === 1 ? "lg:translate-y-12" : ""
                }`}
              >
                <div className="flex items-start gap-5">
                  <span className="font-display text-4xl text-primary">
                    {s.n}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl text-foreground">
                      {s.t}
                    </h3>
                    <p className="mt-2 text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
