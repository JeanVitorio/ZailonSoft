import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Rocket } from "lucide-react";
import { whatsappLink } from "./WhatsappFloat";
import { SocialProof } from "./SocialProof";
import { RotatingWords } from "./RotatingWords";
import { CodeWindow } from "./CodeWindow";
import { AnimatedCounter } from "./AnimatedCounter";

export const Hero = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
    >
      <div className="container-wide">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
               <Sparkles className="h-3.5 w-3.5" />
                Na selva digital, sua empresa no topo
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-balance text-5xl leading-[1.02] md:text-6xl lg:text-7xl"
            >
              Sites e sistemas que{" "}
              <RotatingWords />
              <br />
              todos os dias.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-7 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl"
            >
              Estratégia, design e código sob medida para transformar visitantes em
              <span className="text-foreground"> clientes pagantes</span> com performance que impressiona.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <a
                href={whatsappLink(
                  "Olá Jean! Quero um site/sistema que venda mais. Pode me passar um orçamento?"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group relative inline-flex items-center gap-2 rounded-full bg-gradient-orange px-7 py-4 text-base font-semibold text-primary-foreground shadow-orange transition-transform hover:scale-[1.03]"
              >
                <Rocket className="h-4 w-4" />
                Quero vender mais
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Zap className="h-4 w-4 text-primary" />
                Ver serviços
              </a>
            </motion.div>

            <div className="mt-12">
              <SocialProof />
            </div>
          </div>

          {/* RIGHT — code window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="animate-float-slow">
              <CodeWindow />
            </div>
          </motion.div>
        </div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4"
        >
          {[
            { v: <><AnimatedCounter to={312} suffix="%" prefix="+" /></>, l: "vendas geradas" },
            { v: <><AnimatedCounter to={8} suffix="+ anos" /></>, l: "de experiência" },
            { v: <><AnimatedCounter to={40} suffix="+" /></>, l: "projetos entregues" },
            { v: <><AnimatedCounter to={4.9} decimals={1} suffix="★" /></>, l: "avaliação dos clientes" },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 bg-card/80 px-4 py-7 backdrop-blur"
            >
              <div className="font-display text-3xl text-primary md:text-4xl glow-orange">
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
