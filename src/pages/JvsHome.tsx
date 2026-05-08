import React, { useRef } from 'react';
import JeanFoto from "@/assets/jean.jpg";
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Code2, Rocket, ShieldCheck, Zap, Cpu, LineChart,
  Layers, Smartphone, MessageCircle, ChevronDown, Star, Check, Eye,
  Globe, Layout, Monitor, ShoppingBag, Search, MapPin, Workflow, Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import jvsLogo from '@/assets/jvs-logo.png';
import niloLogo from '@/assets/nilo-logo.png';
import niloHero from '@/assets/nilo-hero-car.jpg';
import { useBrandFavicon } from '@/hooks/useBrandFavicon';

const WHATSAPP = 'https://wa.me/5546991163405?text=Olá%20JVS!%20Quero%20um%20orçamento';

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = '',
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

const RotatingPhrase: React.FC = () => {
  const words = ['vendem mais', 'convertem', 'impressionam', 'escalam', 'geram receita'];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block min-h-[1.1em] align-baseline">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
      >
        {words[i]}
      </motion.span>
    </span>
  );
};

const services = [
  {
    icon: Layout, title: 'Landing Pages', highlight: 'Mais procurado',
    desc: 'Páginas focadas em uma única ação: gerar leads ou vendas direto.',
    points: ['Copy persuasiva', 'Carregamento <1s', 'A/B test ready'],
  },
  {
    icon: Globe, title: 'Sites Institucionais',
    desc: 'Presença digital sólida que transmite autoridade e converte visitas.',
    points: ['Design exclusivo', 'SEO otimizado', 'Blog integrado'],
  },
  {
    icon: Monitor, title: 'Sistemas Web',
    desc: 'Plataformas internas sob medida que automatizam e escalam operações.',
    points: ['Painel administrativo', 'Banco de dados', 'APIs integradas'],
  },
  {
    icon: ShoppingBag, title: 'E-commerce',
    desc: 'Lojas virtuais otimizadas para conversão e ticket médio crescente.',
    points: ['Checkout otimizado', 'Pagamento integrado', 'Recuperação de carrinho'],
  },
];

const processSteps = [
  { n: '01', icon: Search, title: 'Diagnóstico', desc: 'Entendemos seu negócio, seu cliente e onde está a maior oportunidade de venda.' },
  { n: '02', icon: MapPin, title: 'Estratégia', desc: 'Mapeamos jornada, copy, ofertas e o caminho exato que leva o visitante à conversão.' },
  { n: '03', icon: Code2, title: 'Design + Código', desc: 'Construção sob medida, performance extrema e UX validado a cada decisão.' },
  { n: '04', icon: Rocket, title: 'Lançamento + Otimização', desc: 'Publicamos, medimos, ajustamos. O projeto continua evoluindo para vender mais.' },
];

const stack = ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Node.js', 'Supabase', 'Stripe', 'Framer Motion', 'Vite', 'Figma', 'Vercel', 'Python'];

const faqs = [
  { q: 'Quanto tempo leva para entregar um projeto?', a: 'Landing pages em 7 a 14 dias, sites institucionais em 3 a 5 semanas, e sistemas sob medida com cronograma combinado no escopo. Você acompanha cada entrega.' },
  { q: 'Quanto custa um site da JVS?', a: 'Cada projeto é único. Após o diagnóstico gratuito enviamos uma proposta clara, com escopo, prazo e investimento sem letra miúda.' },
  { q: 'E se eu não gostar do resultado?', a: 'Trabalhamos por entregas validadas. Cada etapa só avança com seu OK então o resultado final é exatamente o que combinamos.' },
  { q: 'Vocês dão suporte depois da entrega?', a: 'Sim. Todo projeto inclui suporte pós-lançamento e oferecemos planos de evolução contínua para quem quer crescer mais rápido.' },
  { q: 'Vocês também fazem o tráfego pago e SEO?', a: 'Construímos sites otimizados para SEO desde o código. Para tráfego pago, conectamos você com parceiros que já validamos.' },
  { q: 'Trabalham com empresas pequenas?', a: 'Trabalhamos com empresas de qualquer porte que levam a sério o crescimento do empreendedor solo à indústria.' },
];

const JvsHome: React.FC = () => {
  useBrandFavicon('jvs');

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);

  const niloSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: niloProgress } = useScroll({
    target: niloSectionRef, offset: ['start end', 'end start'],
  });
  const carY = useTransform(niloProgress, [0, 0.5, 1], ['-30%', '0%', '20%']);
  const carRotate = useTransform(niloProgress, [0, 1], [-6, 6]);
  const carScale = useTransform(niloProgress, [0, 0.5, 1], [0.85, 1.05, 1]);

  return (
    <div className="relative min-h-screen bg-[#04060f] text-white overflow-hidden">
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-300/5 blur-[140px]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#04060f]/70 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={jvsLogo} alt="JVS Soluções" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_18px_rgba(7,171,216,0.55)]" />
            <div className="hidden sm:block leading-none">
              <p className="text-base font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">JVS</p>
              <p className="text-[10px] tracking-[0.25em] text-white/50 uppercase">Soluções</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#servicos" className="hover:text-cyan-300 transition-colors">Serviços</a>
            <a href="#processo" className="hover:text-cyan-300 transition-colors">Processo</a>
            <a href="#cases" className="hover:text-cyan-300 transition-colors">Cases</a>
            <a href="#sobre" className="hover:text-cyan-300 transition-colors">Sobre</a>
            <a href="#faq" className="hover:text-cyan-300 transition-colors">FAQ</a>
          </nav>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-[0_0_20px_rgba(7,171,216,0.4)]">
              <span className="hidden sm:inline">Quero meu orçamento</span>
              <span className="sm:hidden">Orçamento</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center pt-28 pb-16 z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs sm:text-sm font-medium text-cyan-200">
                Na selva digital, sua empresa no topo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.02] tracking-tight mb-6"
            >
              Sites e sistemas que <br />
              <RotatingPhrase />
              <br />
              <span className="text-white/80">todos os dias.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 px-2"
            >
              Estratégia, design e código sob medida para transformar visitantes em
              <strong className="text-white"> clientes pagantes</strong> com performance que impressiona.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10"
            >
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-[0_0_30px_rgba(7,171,216,0.5)]">
                  <MessageCircle className="w-5 h-5" /> Quero vender mais
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <a href="#servicos" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                  <Eye className="w-5 h-5" /> Ver serviços
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-2 text-sm text-white/60"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-300 text-cyan-300" />
                ))}
              </div>
              <span className="font-semibold text-white">4.9</span>
              <span>· +50 empresas confiam na JVS</span>
            </motion.div>
          </div>

          {/* Code preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9 }}
            className="max-w-3xl mx-auto mt-14 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0a1226] to-[#04060f] shadow-[0_0_60px_rgba(7,171,216,0.15)] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/30">
              <span className="w-3 h-3 rounded-full bg-rose-400/70" />
              <span className="w-3 h-3 rounded-full bg-cyan-300/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs text-white/40 font-mono">JVS@projeto:~ build.tsx</span>
            </div>
            <pre className="p-5 sm:p-6 text-left text-[12px] sm:text-sm font-mono leading-relaxed text-white/80 overflow-x-auto">
              <span className="text-white/40">{'// Construindo seu próximo ativo digital'}</span>{'\n'}
              <span className="text-cyan-300">const</span>{' site = '}<span className="text-blue-300">new</span>{' '}<span className="text-cyan-200">JVS</span>{'({\n'}
              {"  objetivo: "}<span className="text-emerald-300">{"'vender mais'"}</span>{',\n'}
              {"  performance: "}<span className="text-emerald-300">{"'menos de 1s'"}</span>{',\n'}
              {"  design: "}<span className="text-emerald-300">{"'sob medida'"}</span>{',\n'}
              {"  conversao: "}<span className="text-emerald-300">{"'+312%'"}</span>{',\n'}
              {'});\n\n'}
              <span className="text-emerald-400">✓</span>{' Deploy realizado com sucesso.'}
            </pre>
          </motion.div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 max-w-5xl mx-auto">
            {[
              { n: '+312%', l: 'vendas geradas' },
              { n: '8+ anos', l: 'de experiência' },
              { n: '40+', l: 'projetos entregues' },
              { n: '4.9★', l: 'avaliação dos clientes' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="text-center p-5 rounded-2xl bg-gradient-to-br from-cyan-500/[0.06] to-transparent border border-white/10 backdrop-blur-sm"
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">{s.n}</p>
                <p className="text-xs sm:text-sm text-white/50 mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 z-10"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </motion.div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80 mb-4">◆ O que fazemos</p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Tudo que sua empresa precisa para <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">crescer no digital</span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
              Cada projeto é construído do zero, pensado para o seu modelo de negócio
              e com foco em um único objetivo: <strong className="text-white">vender mais</strong>.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {services.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                  className="group relative p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-sm overflow-hidden h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                  {s.highlight && (
                    <span className="absolute top-4 right-4 text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                      {s.highlight}
                    </span>
                  )}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <s.icon className="w-6 h-6 text-cyan-300" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-white">{s.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{s.desc}</p>
                    <ul className="space-y-1.5">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-white/70">
                          <Check className="w-4 h-4 text-cyan-300 flex-shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors">
              Não sei qual escolher? <span className="underline underline-offset-4">Fale com a gente</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </AnimatedSection>
        </div>
      </section>

      {/* NILO PRODUCT */}
      <section ref={niloSectionRef} id="cases" className="relative py-20 sm:py-32 z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-blue-500/[0.04] to-transparent" />
        <motion.div
          style={{ y: useTransform(niloProgress, [0, 1], ['-20%', '20%']) }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1200px] h-[600px] bg-cyan-500/15 blur-[140px] rounded-full"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Trophy className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs sm:text-sm font-medium text-cyan-200">Case de destaque · Nosso SaaS</span>
            </div>
            <img src={niloLogo} alt="NILO" className="h-16 sm:h-20 object-contain mx-auto mb-6 drop-shadow-[0_0_30px_rgba(7,171,216,0.55)]" />
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              O sistema que <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                lojas de veículos
              </span> esperavam
            </h2>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto px-2">
              Catálogo profissional, CRM inteligente e dashboards de vendas em uma plataforma só.
              Desenvolvido pela JVS para acelerar concessionárias e revendas.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mt-16">
            <AnimatedSection>
              <motion.div style={{ y: carY, rotate: carRotate, scale: carScale }} className="relative">
                <div className="absolute inset-0 bg-cyan-500/25 blur-3xl rounded-full" />
                <img
                  src={niloHero}
                  alt="Veículo de luxo azul com neon ciano"
                  className="relative w-full rounded-3xl shadow-[0_30px_80px_rgba(7,171,216,0.35)] border border-cyan-500/20"
                  loading="lazy"
                />
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-3">
                {[
                  { icon: Layers, label: 'Catálogo público com link único' },
                  { icon: Zap, label: 'CRM Kanban com priorização inteligente' },
                  { icon: LineChart, label: 'Dashboard de vendas em tempo real' },
                  { icon: ShieldCheck, label: 'Multi-tenant com isolamento total' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }} viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/[0.08] to-transparent border border-cyan-500/20 hover:border-cyan-400/50 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-cyan-300" />
                    </div>
                    <p className="font-medium text-white/90">{f.label}</p>
                    <Check className="w-5 h-5 text-emerald-400 ml-auto" />
                  </motion.div>
                ))}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link to="/nilo" className="flex-1">
                    <Button size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(7,171,216,0.4)]">
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

      {/* PROCESSO */}
      <section id="processo" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80 mb-4">◆ Como trabalhamos</p>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Um processo claro, do briefing ao resultado</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Sem mistério, sem atraso. Você sabe exatamente onde seu projeto está em cada etapa.</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {processSteps.map((s, i) => (
              <AnimatedSection key={s.n} delay={i * 0.1}>
                <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 backdrop-blur-sm">
                  <div className="text-5xl font-bold bg-gradient-to-br from-cyan-400/40 to-blue-500/10 bg-clip-text text-transparent mb-2">{s.n}</div>
                  <s.icon className="w-6 h-6 text-cyan-300 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="relative w-full max-w-md mx-auto">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,rgba(7,171,216,0.5),rgba(0,46,133,0.1),rgba(103,246,205,0.5),rgba(7,171,216,0.5))] blur-2xl"
                />
                  <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-cyan-500/30 to-blue-700/30 border border-cyan-400/30 flex items-center justify-center overflow-hidden">
                    <img
                      src={JeanFoto}
                      alt="Jean"
                      className="w-full h-full object-cover"
                    />
                  </div>                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/80 border border-cyan-500/30 backdrop-blur-md text-sm whitespace-nowrap">
                  <span className="font-bold text-white">Jean</span>
                  <span className="text-cyan-300"> · CEO & Fundador</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80 mb-4">◆ Quem está por trás</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
                Mais de 8 anos construindo soluções <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">que geram receita</span>.
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                A JVS nasceu da experiência prática em projetos reais. Não entregamos sites
                construímos máquinas de conversão pensadas para um único objetivo: <strong className="text-white">aumentar suas vendas</strong>.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  '+8 anos estudando desenvolvimento',
                  '+50 projetos entregues',
                  'Atuação em varejo, indústria e serviços',
                  'Foco obsessivo em performance',
                ].map((p) => (
                  <li key={p} className="flex items-center gap-3 text-white/80">
                    <Check className="w-5 h-5 text-cyan-300" /> {p}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <p className="text-xs tracking-wider uppercase text-white/50 mb-3">Stack que dominamos</p>
                <div className="flex flex-wrap gap-2">
                  {stack.map((t) => (
                    <span key={t} className="px-3 py-1.5 text-xs rounded-full bg-white/[0.04] border border-cyan-500/20 text-white/80 hover:border-cyan-400/50 transition-colors">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80 mb-4">◆ Dúvidas frequentes</p>
            <h2 className="text-3xl sm:text-5xl font-bold">Tudo que você precisa saber antes</h2>
          </AnimatedSection>

          <AnimatedSection>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i} value={`item-${i}`}
                  className="border border-white/10 rounded-xl px-5 bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur-sm hover:border-cyan-500/40 transition-colors"
                >
                  <AccordionTrigger className="text-left text-white hover:text-cyan-300 hover:no-underline py-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/65 pb-4 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contato" className="relative py-20 sm:py-28 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <AnimatedSection>
            <div className="relative p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-cyan-300/10 border border-cyan-500/30 text-center overflow-hidden backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,rgba(7,171,216,0)_0%,rgba(7,171,216,0.18)_50%,rgba(7,171,216,0)_100%)]"
              />
              <div className="relative">
                <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80 mb-4">◆ Última chamada</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight">
                  Se o seu site <span className="text-cyan-300">não vende</span>, <br className="hidden sm:block" />
                  você já sabe o problema.
                </h2>
                <p className="text-white/70 max-w-xl mx-auto mb-8 text-sm sm:text-base">
                  Fale agora com a gente no WhatsApp. Diagnóstico gratuito e sem compromisso.
                  Em 24h você recebe um plano de ação para vender mais.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6">
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(7,171,216,0.5)]">
                      <MessageCircle className="w-5 h-5" /> Quero um site que vende
                    </Button>
                  </a>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/55">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-300" /> Orçamento sem compromisso</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-300" /> Resposta em até 2h</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 py-12 z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src={jvsLogo} alt="JVS" className="w-9 h-9 object-contain" />
                <span className="font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">JVS Soluções</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">
                Sites e sistemas sob medida focados em conversão. Construímos máquinas que vendem todos os dias.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-white/40 mb-3">Navegação</p>
              <ul className="space-y-2 text-sm text-white/65">
                <li><a href="#servicos" className="hover:text-cyan-300">Serviços</a></li>
                <li><a href="#processo" className="hover:text-cyan-300">Processo</a></li>
                <li><a href="#cases" className="hover:text-cyan-300">Cases</a></li>
                <li><a href="#faq" className="hover:text-cyan-300">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-white/40 mb-3">Contato</p>
              <ul className="space-y-2 text-sm text-white/65">
                <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">WhatsApp · (46) 99116-3405</a></li>
                <li>Atendimento online · Brasil</li>
                <li><Link to="/login" className="hover:text-cyan-300">Entrar no sistema</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <span>© {new Date().getFullYear()} JVS Soluções. Todos os direitos reservados.</span>
            <span>Sites e sistemas que vendem.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JvsHome;
