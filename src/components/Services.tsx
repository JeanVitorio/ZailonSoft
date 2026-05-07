import { motion } from "framer-motion";
import { Code2, Layout, ShoppingBag, Zap, ArrowRight, Check } from "lucide-react";
import { whatsappLink } from "./WhatsappFloat";
import { SpotlightCard } from "./SpotlightCard";

const services = [
  {
    icon: Layout,
    title: "Landing Pages",
    desc: "Páginas focadas em uma única ação: gerar leads ou vendas direto.",
    bullets: ["Copy persuasiva", "Carregamento <1s", "A/B test ready"],
    badge: "Mais procurado",
  },
  {
    icon: ShoppingBag,
    title: "Sites Institucionais",
    desc: "Presença digital sólida que transmite autoridade e converte visitas.",
    bullets: ["Design exclusivo", "SEO otimizado", "Blog integrado"],
  },
  {
    icon: Code2,
    title: "Sistemas Web",
    desc: "Plataformas internas sob medida que automatizam e escalam operações.",
    bullets: ["Painel administrativo", "Banco de dados", "API integradas"],
  },
  {
    icon: Zap,
    title: "E-commerce",
    desc: "Lojas virtuais otimizadas para conversão e ticket médio crescente.",
    bullets: ["Checkout otimizado", "Pagamento integrado", "Recuperação de carrinho"],
  },
];

export const Services = () => {
  return (
    <section id="servicos" className="relative py-24 md:py-32">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            ◆ O que fazemos
          </span>
          <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">
            Tudo que sua empresa precisa para{" "}
            <span className="gradient-text">crescer no digital</span>
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            Cada projeto é construído do zero, pensado para o seu modelo de negócio
            e com foco em um único objetivo: vender mais.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpotlightCard className="group flex h-full flex-col rounded-2xl border border-border/80 bg-gradient-card p-7 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-orange-soft">
                {s.badge && (
                  <span className="absolute -top-2.5 right-5 rounded-full bg-gradient-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-orange-soft">
                    {s.badge}
                  </span>
                )}
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-gradient-orange group-hover:text-primary-foreground group-hover:shadow-orange-soft group-hover:-rotate-6 group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute inset-0 -z-10 rounded-xl bg-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <h3 className="font-display text-xl text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border/70 pt-5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground/85">{b}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={whatsappLink("Olá! Quero saber qual serviço da JVS é ideal para minha empresa.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Não sei qual escolher? Fale com a gente
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
