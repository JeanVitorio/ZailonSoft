import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Clock, ArrowRight, Sparkles } from "lucide-react";
import { whatsappLink } from "./WhatsappFloat";

export const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="gradient-border relative overflow-hidden p-10 text-center md:p-16"
        >
          {/* glow */}
          <div
            aria-hidden
            className="absolute -top-40 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px] animate-aurora-1"
          />
          <div
            aria-hidden
            className="absolute -bottom-40 right-0 h-72 w-[500px] rounded-full bg-accent/25 blur-[120px] animate-aurora-2"
          />

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Última chamada
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-balance md:text-5xl lg:text-6xl">
            Se o seu site{" "}
            <span className="text-foreground/40 line-through">não vende</span>,{" "}
            <span className="gradient-text animate-gradient-shift bg-[linear-gradient(110deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary-deep)),hsl(var(--primary)))] bg-clip-text text-transparent">
              você já sabe o problema.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Fale agora com a gente no WhatsApp. Diagnóstico gratuito e sem
            compromisso. Em 24h você recebe um plano de ação para vender mais.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={whatsappLink(
                "Olá Jean! Quero conversar sobre criar um site/sistema que venda mais para minha empresa."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine group relative inline-flex items-center gap-3 rounded-full bg-gradient-orange px-9 py-5 text-base font-bold text-primary-foreground shadow-orange transition-transform hover:scale-[1.04]"
            >
              <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full" />
              <MessageCircle className="h-5 w-5" />
              Quero um site que vende
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" />
                Orçamento sem compromisso
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Resposta em até 2h
              </div>
            </div>
          </div>

          {/* <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-primary/80">
            Apenas 4 vagas por mês · Confira a disponibilidade
          </p> */}
        </motion.div>
      </div>
    </section>
  );
};
