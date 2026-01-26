// src/pages/HomePage.tsx
import { motion } from "framer-motion";
import { ArrowRight, Bot, Car, Code2, Sparkles, Zap, BarChart3, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  hover: { scale: 1.05, y: -8, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" },
  transition: { type: "spring", stiffness: 300, damping: 20 }
};

const iconHover = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 8 }
};

export default function HomePage() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>ZailonSoft – Software que vende, automatiza e escala</title>
        <meta
          name="description"
          content="Soluções sob medida e Zailon Auto: pré-vendas automático para lojas de veículos. Pare de perder vendas e escale com tecnologia inteligente."
        />
      </Helmet>

      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-cyan-600/10 to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" /> Soluções que geram receita real
              </motion.span>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
              >
                Tecnologia que <span className="text-emerald-400">vende</span>,
                <br /> automatiza e escala
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-6 text-xl text-neutral-400 max-w-xl leading-relaxed"
              >
                Criamos software sob medida e o Zailon Auto — sistema de pré-vendas automático que trabalha 24/7 para lojas de veículos, qualificando leads e aumentando conversão sem aumentar equipe.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-5">
                <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                  <Link
                    to="/leadflow"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-semibold text-lg shadow-lg shadow-emerald-900/30"
                  >
                    Conhecer Zailon Auto <Car className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                  <a
                    href="#sob-medida"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-neutral-700 hover:bg-neutral-800/50 transition font-semibold text-lg"
                  >
                    Software sob medida <ArrowRight className="w-5 h-5" />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Visual com cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 p-10 backdrop-blur-sm shadow-2xl shadow-black/40">
                <div className="grid grid-cols-2 gap-6">
                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <FeatureCard icon={<Bot className="w-8 h-8" />} title="Atendimento Inteligente" color="emerald" />
                  </motion.div>
                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <FeatureCard icon={<Car className="w-8 h-8" />} title="Pré-vendas Auto" color="emerald" />
                  </motion.div>
                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <FeatureCard icon={<Code2 className="w-8 h-8" />} title="Software Custom" color="cyan" />
                  </motion.div>
                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <FeatureCard icon={<Zap className="w-8 h-8" />} title="Automação Total" color="cyan" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Segmentação / Quem somos */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-8">
              Software para quem precisa de <span className="text-emerald-400">resultado real</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-neutral-400 mb-12">
              Não vendemos pacotes genéricos. Criamos soluções que resolvem dores específicas de negócios reais.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Lojas de veículos e concessionárias",
                "Negócios com alta demanda no WhatsApp",
                "Empresas com processos manuais caros",
                "Indústrias que precisam de controle total",
                "Serviços que dependem de vendas consultivas",
                "Qualquer operação que quer escalar sem caos"
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                  variants={cardHover}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center"
                >
                  <p className="text-lg font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Software sob medida */}
        <section id="sob-medida" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-center mb-6">
              Software <span className="text-emerald-400">sob medida</span> quando o genérico não basta
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-neutral-400 text-center max-w-3xl mx-auto mb-16">
              Plataformas exclusivas, integrações profundas, automações complexas e dashboards feitos exatamente para o seu fluxo de negócio.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                <ServiceCard
                  icon={<Code2 className="w-10 h-10 text-cyan-400" />}
                  title="Sistemas Web & SaaS Custom"
                  text="Plataformas rápidas, seguras e escaláveis construídas do zero para o seu modelo de negócio."
                />
              </motion.div>
              <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                <ServiceCard
                  icon={<Zap className="w-10 h-10 text-cyan-400" />}
                  title="Automações & Integrações"
                  text="Conecte WhatsApp, ERP, CRM, pagamentos e tudo que você usa. Adeus tarefas repetitivas."
                />
              </motion.div>
              <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                <ServiceCard
                  icon={<BarChart3 className="w-10 h-10 text-cyan-400" />}
                  title="Dashboards e Inteligência"
                  text="Visão 360° em tempo real. Relatórios que mostram onde está o dinheiro de verdade."
                />
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="text-center mt-16">
              <motion.a
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20software%20sob%20medida%20para%20meu%20neg%C3%B3cio."
                target="_blank"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/30 transition"
              >
                Quero meu software sob medida <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* Zailon Auto */}
        <section id="zailon-auto" className="bg-neutral-900/60 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <h2 className="text-5xl font-bold mb-6">
                Zailon <span className="text-emerald-400">Auto</span>
              </h2>

              <p className="text-2xl text-neutral-300 mb-8">
                O sistema de pré-vendas que trabalha enquanto você dorme.
              </p>

              <ul className="space-y-5 text-lg text-neutral-300 mb-10">
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 text-emerald-400">•</div>
                  Atende todos os leads 24h por dia no WhatsApp
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 text-emerald-400">•</div>
                  Qualifica automaticamente — só vendedor fala com lead quente
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 text-emerald-400">•</div>
                  Coleta dados essenciais antes de passar para equipe
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1.5 text-emerald-400">•</div>
                  Aumenta conversão sem aumentar folha de pagamento
                </li>
              </ul>

              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/leadflow"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/30 transition"
                >
                  Ver Zailon Auto em ação <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-3xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/10 border border-emerald-800/30 p-10 shadow-2xl"
              whileHover={{ scale: 1.03 }}
            >
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-6 text-emerald-400 animate-pulse" />
                <p className="text-3xl font-bold mb-4">Seu vendedor que nunca dorme</p>
                <p className="text-xl text-neutral-400">24/7 qualificando e atendendo — você só fecha negócio.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA FINAL (desktop) */}
        <section className="max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-8"
          >
            Qual caminho resolve sua dor hoje?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-neutral-400 mb-12 max-w-3xl mx-auto"
          >
            Software sob medida ou Zailon Auto pronto para usar. Escolha o que faz sentido para o seu negócio agora.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/leadflow"
                className="px-10 py-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xl shadow-lg shadow-emerald-900/40 transition"
              >
                Quero o Zailon Auto agora
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20software%20sob%20medida%20para%20meu%20neg%C3%B3cio."
                target="_blank"
                className="px-10 py-6 border border-neutral-700 hover:bg-neutral-800/50 rounded-xl font-bold text-xl transition"
              >
                Quero software sob medida
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Sticky CTA mobile – corrigido e responsivo */}
      <div className="md:hidden fixed inset-x-4 bottom-6 z-50 flex gap-4 max-w-md mx-auto pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-0"
        >
          <Link
            to="/leadflow"
            className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-center text-base shadow-lg shadow-emerald-900/40 transition"
          >
            Quero o Zailon Auto agora
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 min-w-0"
        >
          <a
            href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20software%20sob%20medida%20para%20meu%20neg%C3%B3cio."
            target="_blank"
            className="block w-full py-4 px-6 border border-neutral-700 hover:bg-neutral-800/50 rounded-xl font-bold text-center text-base transition shadow-md"
          >
            Quero software sob medida
          </a>
        </motion.div>
      </div>

      <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-6 text-center text-neutral-500">
        <p>© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
      </footer>
    </HelmetProvider>
  );
}

function FeatureCard({ icon, title, color = "emerald" }: { icon: React.ReactNode; title: string; color?: "emerald" | "cyan" }) {
  const colorClass = color === "emerald" ? "text-emerald-400" : "text-cyan-400";
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      variants={cardHover}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-center"
    >
      <motion.div variants={iconHover} className={`flex justify-center mb-4 ${colorClass}`}>
        {icon}
      </motion.div>
      <p className="font-semibold">{title}</p>
    </motion.div>
  );
}

function ServiceCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      variants={cardHover}
      className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-10 hover:border-emerald-700/50 transition group"
    >
      <motion.div
        variants={iconHover}
        className="text-emerald-400 mb-6 group-hover:scale-110 transition"
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{text}</p>
    </motion.div>
  );
}