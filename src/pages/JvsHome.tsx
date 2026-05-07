import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Code2, Rocket, ShieldCheck, Zap, Cpu, LineChart,
  Layers, Smartphone, MessageCircle, ChevronDown, Car, Star, Check, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import jvsLogo from '@/assets/jvs-logo.png';
import niloLogo from '@/assets/nilo-logo.png';
import niloHero from '@/assets/nilo-hero-car.jpg';
import { useBrandFavicon } from '@/hooks/useBrandFavicon';

/* ──────────────────────────────────────────────────────────────
   "Fanta-scroll" Orb: a single brand orb tracks scrollY and snaps
   into different sections (hero → about → product → footer).
   ────────────────────────────────────────────────────────────── */
const ScrollOrb = ({ progress }: { progress: MotionValue<number> }) => {
  // Path the orb follows (vw / vh based)
  const x = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], ['50vw', '15vw', '85vw', '50vw', '50vw']);
  const y = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], ['25vh', '60vh', '50vh', '70vh', '90vh']);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 1.4, 0.6]);
  const hue = useTransform(progress, [0, 0.5, 1], [240, 280, 30]);

  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });
  const ss = useSpring(scale, { stiffness: 60, damping: 20 });

  return (
    <motion.div
      aria-hidden
      style={{
        x: sx,
        y: sy,
        scale: ss,
        translateX: '-50%',
        translateY: '-50%',
        background: useTransform(hue, (h) => `radial-gradient(circle, hsla(${h},90%,60%,0.55), hsla(${h},90%,40%,0))`),
      }}
      className="pointer-events-none fixed top-0 left-0 w-[28rem] h-[28rem] rounded-full blur-3xl z-0"
    />
  );
};

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0)' } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ────────── Mini animated "product preview" cards for NILO ────────── */
const NiloKanbanPreview = () => (
  <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm">
    {['Novos', 'Negociando', 'Fechados'].map((col, ci) => (
      <div key={col} className="space-y-1.5">
        <p className="text-[9px] font-semibold text-amber-400/80 uppercase tracking-wider">{col}</p>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + ci * 0.15 + i * 0.1, duration: 0.5 }}
            className="h-8 rounded-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 px-1.5 flex flex-col justify-center"
          >
            <div className="h-1 w-12 bg-white/30 rounded-full mb-0.5" />
            <div className="h-0.5 w-8 bg-amber-400/60 rounded-full" />
          </motion.div>
        ))}
      </div>
    ))}
  </div>
);

const NiloDashboardPreview = () => (
  <div className="p-3 bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm">
    <div className="flex items-end gap-1 h-20 mb-2">
      {[60, 35, 80, 50, 90, 70, 100].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
          className="flex-1 rounded-t bg-gradient-to-t from-amber-500 to-amber-300"
        />
      ))}
    </div>
    <div className="flex justify-between text-[9px] text-white/60">
      <span>Vendas</span>
      <span className="text-emerald-400">+38%</span>
    </div>
  </div>
);

const NiloCatalogPreview = () => (
  <div className="grid grid-cols-2 gap-1.5 p-3 bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm">
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 + i * 0.1 }}
        className="aspect-video rounded-md bg-gradient-to-br from-amber-500/30 via-orange-500/10 to-transparent border border-white/10 relative overflow-hidden"
      >
        <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/30 rounded-full" />
        <Car className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-400/70" />
      </motion.div>
    ))}
  </div>
);

const JvsHome: React.FC = () => {
  useBrandFavicon('jvs');

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  // NILO section: car image scrolls in and "lands"
  const niloSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: niloProgress } = useScroll({
    target: niloSectionRef,
    offset: ['start end', 'end start'],
  });
  const carY = useTransform(niloProgress, [0, 0.5, 1], ['-30%', '0%', '20%']);
  const carRotate = useTransform(niloProgress, [0, 1], [-6, 6]);
  const carScale = useTransform(niloProgress, [0, 0.5, 1], [0.85, 1.05, 1]);

  const services = [
    { icon: Code2, title: 'Sistemas sob medida', desc: 'Software customizado para o seu fluxo de trabalho. Sem amarras, sem limites.' },
    { icon: Cpu, title: 'Automação inteligente', desc: 'Eliminamos tarefas repetitivas com automações precisas e integradas.' },
    { icon: LineChart, title: 'Dashboards & BI', desc: 'Decisões baseadas em dados, com visualizações claras e em tempo real.' },
    { icon: Smartphone, title: 'Apps web e mobile', desc: 'Experiências fluidas em qualquer tela, com performance de ponta.' },
    { icon: ShieldCheck, title: 'Segurança em primeiro lugar', desc: 'Arquitetura blindada, criptografia e isolamento total por cliente.' },
    { icon: Rocket, title: 'Entrega ágil', desc: 'Da ideia ao MVP em semanas. Iteramos rápido, sem perder qualidade.' },
  ];

  const niloFeatures = [
    { icon: Layers, label: 'Catálogo público com link único' },
    { icon: Zap, label: 'CRM Kanban com IA de priorização' },
    { icon: LineChart, label: 'Dashboard de vendas em tempo real' },
    { icon: ShieldCheck, label: 'Multi-tenant com isolamento total' },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#06060d] text-white overflow-hidden">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      {/* The "Fanta-scroll" orb that travels through the page */}
      <ScrollOrb progress={scrollYProgress} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#06060d]/70 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img src={jvsLogo} alt="JVS Soluções" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <div className="hidden sm:block leading-none">
              <p className="text-base font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">JVS</p>
              <p className="text-[10px] tracking-[0.25em] text-white/50 uppercase">Soluções</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#sobre" className="hover:text-white transition-colors">Sobre</a>
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#nilo" className="hover:text-white transition-colors">NILO</a>
            <a href="#contato" className="hover:text-white transition-colors">Contato</a>
          </nav>
          <a href="https://wa.me/5546991163405?text=Olá! Quero conhecer as soluções da JVS" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white border-0">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Fale conosco</span>
              <span className="sm:hidden">Contato</span>
            </Button>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center pt-24 pb-16 z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 sm:px-6 text-center relative">
          {/* Floating glowing logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-8 relative w-32 h-32 sm:w-44 sm:h-44"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 via-violet-500/20 to-transparent blur-2xl"
            />
            <img src={jvsLogo} alt="JVS Soluções" className="relative w-full h-full object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-violet-500/20 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
              Software house · SaaS · Automação
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Tecnologia que <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              move negócios
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 px-2"
          >
            Construímos sistemas sob medida e produtos SaaS que escalam. Da estratégia ao deploy,
            entregamos software que <strong className="text-white">faz a sua empresa crescer</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
          >
            <a href="#nilo" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                <Eye className="w-5 h-5" /> Ver nosso produto
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" variant="glass" className="w-full sm:w-auto">
                <MessageCircle className="w-5 h-5" /> Falar com a equipe
              </Button>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 z-10"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </motion.div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-violet-300/80 mb-4">Quem somos</p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Software de <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">verdade</span>,
              feito para <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">durar</span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
              A JVS Soluções nasceu para resolver o que software pronto não resolve.
              Construímos sistemas robustos, bonitos e fáceis de usar — combinando design, engenharia e estratégia
              para criar produtos que sua equipe ama e seus clientes percebem a diferença.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16">
            {[
              { n: '50+', l: 'Projetos entregues' },
              { n: '100%', l: 'Foco no cliente' },
              { n: '24/7', l: 'Suporte ativo' },
              { n: '0', l: 'Mensalidades escondidas' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{s.n}</p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">{s.l}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-violet-300/80 mb-4">O que fazemos</p>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Soluções completas, ponta a ponta</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Da análise inicial à manutenção contínua, cuidamos de cada detalhe.</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-violet-500/0 to-violet-500/0 group-hover:from-blue-500/10 group-hover:to-violet-500/10 transition-all duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <s.icon className="w-6 h-6 text-violet-300" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* NILO PRODUCT - the headliner */}
      <section ref={niloSectionRef} id="nilo" className="relative py-20 sm:py-32 z-10 overflow-hidden">
        {/* Glow background tied to scroll */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-orange-500/[0.04] to-transparent" />
        <motion.div
          style={{ y: useTransform(niloProgress, [0, 1], ['-20%', '20%']) }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1200px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs sm:text-sm font-medium text-amber-300">Nosso produto principal</span>
            </div>

            <img src={niloLogo} alt="NILO" className="h-16 sm:h-20 object-contain mx-auto mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]" />

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              O sistema que <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                lojas de veículos
              </span> esperavam
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto px-2">
              Catálogo profissional, CRM inteligente e dashboards de vendas em uma plataforma só.
              Desenvolvido pela JVS para acelerar o crescimento de concessionárias e revendas.
            </p>
          </AnimatedSection>

          {/* The car that floats and "snaps" with scroll */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mt-16">
            <AnimatedSection>
              <motion.div
                style={{ y: carY, rotate: carRotate, scale: carScale }}
                className="relative"
              >
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                <img
                  src={niloHero}
                  alt="Veículo de luxo dourado"
                  className="relative w-full rounded-3xl shadow-[0_30px_80px_rgba(251,191,36,0.25)]"
                  loading="lazy"
                />
                {/* Floating UI badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="absolute -left-4 top-1/4 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/30 hidden sm:block"
                >
                  <p className="text-[10px] text-white/50">Lead recebido</p>
                  <p className="text-sm font-semibold text-amber-300">+1 cliente quente</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="absolute -right-4 bottom-1/4 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/30 hidden sm:block"
                >
                  <p className="text-[10px] text-white/50">Conversão</p>
                  <p className="text-sm font-semibold text-emerald-400">↑ 38% este mês</p>
                </motion.div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-3">
                {niloFeatures.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.06] to-transparent border border-amber-500/15 hover:border-amber-500/40 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="font-medium text-white/90">{f.label}</p>
                    <Check className="w-5 h-5 text-emerald-400 ml-auto" />
                  </motion.div>
                ))}

                {/* Mini animated previews row */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <NiloKanbanPreview />
                  <NiloDashboardPreview />
                  <NiloCatalogPreview />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to="/nilo" className="flex-1">
                    <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                      <Rocket className="w-5 h-5" /> Conhecer o NILO
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/demo" className="flex-1">
                    <Button size="lg" variant="glass" className="w-full">
                      <Eye className="w-5 h-5" /> Ver demonstração
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA / Contato */}
      <section id="contato" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <AnimatedSection>
            <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 text-center overflow-hidden backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,rgba(99,102,241,0)_0%,rgba(139,92,246,0.15)_50%,rgba(99,102,241,0)_100%)]"
              />
              <div className="relative">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
                  Vamos construir <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">algo grande</span> juntos?
                </h2>
                <p className="text-white/70 max-w-xl mx-auto mb-8 text-sm sm:text-base">
                  Conta pra gente o desafio da sua empresa. Em até 24h, retornamos com um plano sob medida.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <a href="https://wa.me/5546991163405?text=Olá JVS! Quero conversar sobre um projeto" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white border-0">
                      <MessageCircle className="w-5 h-5" /> Conversar no WhatsApp
                    </Button>
                  </a>
                  <a href="mailto:contato@jvssolucoes.com.br" className="w-full sm:w-auto">
                    <Button size="lg" variant="glass" className="w-full sm:w-auto">
                      contato@jvssolucoes.com.br
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 py-10 z-10">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={jvsLogo} alt="JVS" className="w-8 h-8 object-contain" />
            <span className="text-sm text-white/50">JVS Soluções © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-white/50">
            <a href="#sobre" className="hover:text-white transition-colors">Sobre</a>
            <a href="#nilo" className="hover:text-white transition-colors">NILO</a>
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JvsHome;
