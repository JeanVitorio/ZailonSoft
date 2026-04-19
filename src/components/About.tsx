import { motion } from "framer-motion";
import { Check, Award } from "lucide-react";
import jeanPortrait from "@/assets/jean.jpg";

export const About = () => {
  return (
    <section id="sobre" className="relative py-24 md:py-32">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-orange opacity-30 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border shadow-elevated">
                <img
                  src={jeanPortrait}
                  alt="Jean — fundador da Zailonsoft, desenvolvedor e estrategista de conversão"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-border bg-card/95 px-5 py-3 backdrop-blur">
                <div>
                  <div className="font-display text-base">Jean</div>
                  <div className="text-xs text-muted-foreground">
                    Fundador & Desenvolvedor
                  </div>
                </div>
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              ◆ Quem está por trás
            </span>
            <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">
              Mais de <span className="gradient-text">8 anos</span> construindo
              soluções que geram receita.
            </h2>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              A Zailonsoft nasceu da experiência prática em projetos reais. Não
              entregamos sites — construímos máquinas de conversão pensadas
              para um único objetivo: aumentar suas vendas.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "+8 anos estudando desenvolvimento",
                "+40 projetos entregues",
                "Atuação em varejo, indústria e serviços",
                "Foco obsessivo em performance",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Experiência com
              </span>
              <span className="font-display text-lg text-foreground/80">
                Munters
              </span>
              <span className="text-border">•</span>
              <span className="font-display text-lg text-foreground/80">
                Bradesco Seguros
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
