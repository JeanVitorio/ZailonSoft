import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const cases = [
  {
    sector: "E-commerce de moda",
    problem: "Loja com tráfego, mas conversão abaixo de 0,4%.",
    solution: "Reestruturação completa de funil, copy e checkout.",
    result: "+312%",
    metric: "em vendas mensais",
    duration: "60 dias",
  },
  {
    sector: "Indústria — gestão interna",
    problem: "Sistema legado lento que travava a operação.",
    solution: "Reescrita em arquitetura moderna com painel sob medida.",
    result: "−87%",
    metric: "no tempo de operação",
    duration: "90 dias",
  },
  {
    sector: "Clínica de estética",
    problem: "Site institucional bonito, mas zero leads qualificados.",
    solution: "Landing focada em ação + automação de WhatsApp.",
    result: "+8 leads",
    metric: "por dia em 30 dias",
    duration: "30 dias",
  },
];

export const Cases = () => {
  return (
    <section id="cases" className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-radial-orange opacity-30"
      />
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            ◆ Resultados reais
          </span>
          <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">
            Não falamos em portfólio.{" "}
            <span className="gradient-text">Falamos em números.</span>
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            Cada projeto que entregamos vira receita para o cliente. Veja
            algumas transformações reais.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card p-8 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-orange-soft"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {c.sector}
                </span>
                <span className="text-xs text-muted-foreground">{c.duration}</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-display text-5xl text-primary glow-orange">
                  {c.result}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                {c.metric}
              </p>

              <div className="mt-8 space-y-4 border-t border-border pt-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Problema
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{c.problem}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Solução
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{c.solution}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
