import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { whatsappLink } from "./WhatsappFloat";
import { SocialProof } from "./SocialProof";

export const Hero = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
    >
      {/* background layers */}
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <div className="container-tight flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Vagas abertas · Apenas 4 projetos por mês
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-balance text-5xl leading-[1.05] md:text-6xl lg:text-7xl"
        >
          Sites e sistemas que{" "}
          <span className="relative inline-block">
            <span className="gradient-text">vendem mais</span>
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              className="absolute -bottom-2 left-0 h-3 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8 Q 80 2 150 6 T 298 4"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br className="hidden sm:block" />
          todos os dias.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-7 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl"
        >
          Desenvolvemos sites, landing pages e sistemas sob medida focados em{" "}
          <span className="text-foreground">conversão real</span>. Estratégia,
          performance e UX que transformam visitantes em clientes pagantes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href={whatsappLink(
              "Olá Jean! Quero um site/sistema que venda mais. Pode me passar um orçamento?"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-orange transition-all hover:scale-[1.02] hover:bg-primary/90"
          >
            Quero vender mais
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#servicos"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-primary"
          >
            Ver serviços
          </a>
        </motion.div>

        <div className="mt-12">
          <SocialProof />
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border"
        >
          {[
            { v: "+312%", l: "vendas em e-commerce" },
            { v: "8 anos", l: "de experiência" },
            { v: "4.9★", l: "avaliação dos clientes" },
          ].map((s) => (
            <div
              key={s.l}
              className="flex flex-col items-center gap-1 bg-card px-4 py-6"
            >
              <div className="font-display text-2xl text-primary md:text-3xl">
                {s.v}
              </div>
              <div className="text-center text-xs text-muted-foreground md:text-sm">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
