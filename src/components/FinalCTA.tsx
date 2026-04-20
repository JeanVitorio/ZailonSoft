import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { whatsappLink } from "./WhatsappFloat";

export const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-radial-orange opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-card p-10 text-center shadow-elevated md:p-16"
        >
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]"
          />

          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            ◆ Última chamada
          </span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-balance md:text-5xl lg:text-6xl">
            Se o seu site{" "}
            <span className="text-foreground/40 line-through">não vende</span>,{" "}
            <span className="gradient-text">você já sabe o problema.</span>
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
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-5 text-base font-bold text-primary-foreground shadow-orange transition-all hover:scale-[1.03]"
            >
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

          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-primary/80">
            Apenas 4 vagas por mês · Entre em contato e confira a disponibilidade
          </p>
        </motion.div>
      </div>
    </section>
  );
};
