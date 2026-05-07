import { motion } from "framer-motion";
import { Check, Award } from "lucide-react";
import jeanPortrait from "@/assets/jean.jpg";
import { TechMarquee } from "./TechMarquee";

export const About = () => {
  return (
    <section id="sobre" className="relative py-24 md:py-32">
      <div className="container-wide">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-sm">
              {/* glowing rotating ring */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-full opacity-70 blur-2xl"
                style={{ background: "var(--gradient-orange)" }}
              />
              <div
                aria-hidden
                className="absolute -inset-1 rounded-full"
                style={{
                  background:
                    "conic-gradient(from var(--angle, 0deg), hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary-deep)), hsl(var(--primary)))",
                  animation: "spin-border 8s linear infinite",
                }}
              />
              <div className="relative aspect-square overflow-hidden rounded-full border-4 border-background shadow-elevated">
                <img
                  src={jeanPortrait}
                  alt="Jean fundador da JVS Soluções"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              {/* badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-border bg-card/95 px-5 py-2.5 backdrop-blur shadow-card">
                <Award className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <div className="font-display text-sm leading-none">Jean</div>
                  <div className="text-[10px] text-muted-foreground">CEO & Fundador</div>
                </div>
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
              A JVS nasceu da experiência prática em projetos reais. Não
              entregamos sites construímos máquinas de conversão pensadas
              para um único objetivo: aumentar suas vendas.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "+8 anos estudando desenvolvimento",
                "+50 projetos entregues",
                "Atuação em varejo, indústria e serviços",
                "Foco obsessivo em performance",
              ].map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-foreground/90">{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Experiência com
              </span>
              <span className="font-display text-lg text-foreground/80">Munters</span>
              <span className="text-border">•</span>
              <span className="font-display text-lg text-foreground/80">Bradesco Seguros</span>
            </div>
          </motion.div>
        </div>

        {/* tech marquee */}
        <div className="mt-20">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Stack que dominamos
          </p>
          <TechMarquee />
        </div>
      </div>
    </section>
  );
};
