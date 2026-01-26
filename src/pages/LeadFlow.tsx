// src/pages/LeadFlow.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { ArrowRight, Bot, Car, CheckCircle, MessageCircle, Zap, BarChart3, PlayCircle, Clock, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// Vídeos e posters mantidos
import formularioVideo from './Formulario.mp4';
import crmVideo from './CRMKanban.mp4';
import dashboardVideo from './dash.mp4';

const posters = {
  formulario: '/posters/formulario.jpg',
  relatorio: '/posters/relatorio.jpg',
  crm: '/posters/crm.jpg',
  dashboard: '/posters/dashboard.jpg',
};

// Utils mantidos
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
};

const useScrollHeader = (offset = 60) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
};

const useAutoPlayVideo = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const registerVideo = useCallback((el: HTMLVideoElement | null) => {
    if (el && !videoRefs.current.includes(el)) videoRefs.current.push(el);
  }, []);
  useEffect(() => {
    if (videoRefs.current.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: [0.5], rootMargin: '0px 0px -12% 0px' }
    );
    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => {
      videoRefs.current.forEach((v) => v && observer.unobserve(v));
      observer.disconnect();
    };
  }, []);
  return registerVideo;
};

// Variants para animações
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

// Metric e FaqItem
const Metric = ({ value, label }: { value: string; label: string }) => (
  <motion.div
    whileHover="hover"
    initial="rest"
    variants={cardHover}
    className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-8 text-center"
  >
    <p className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-3">{value}</p>
    <p className="text-neutral-400">{label}</p>
  </motion.div>
);

const FaqItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const panelId = useMemo(() => `faq-${btoa(question).slice(0, 8)}`, [question]);
  return (
    <motion.div
      layout
      whileHover="hover"
      initial="rest"
      variants={cardHover}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden"
    >
      <button
        onClick={onClick}
        className="w-full px-8 py-6 text-left flex justify-between items-center font-medium text-lg hover:bg-neutral-800/50 transition"
      >
        <span>{question}</span>
        <Feather.ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-8 pb-6 text-neutral-400"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Mobile Menu
const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/login');
  };

  const menuItems = [
    { label: 'Benefícios', id: 'beneficios' },
    { label: 'Como Funciona', id: 'solucao' },
    { label: 'Resultados', id: 'resultados' },
    { label: 'Planos', id: 'planos' },
    { label: 'Dúvidas', id: 'faq' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden text-emerald-400">
        <Feather.Menu size={28} />
      </SheetTrigger>
      <SheetContent side="left" className="bg-neutral-950 border-r border-neutral-800">
        <div className="text-3xl font-extrabold mb-10">
          Zailon<span className="text-emerald-400">Auto</span>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <nav className="flex flex-col gap-6 text-lg">
            {menuItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-neutral-300 hover:text-emerald-400 transition"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-8 border-t border-neutral-800 mt-8">
              {loading ? (
                <div className="text-neutral-500">Carregando...</div>
              ) : user ? (
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                  Sair
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="text-emerald-400 hover:text-emerald-300" onClick={() => setOpen(false)}>
                    Criar conta
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const LeadFlow = () => {
  const { user, loading, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrolled = useScrollHeader(60);
  const registerVideo = useAutoPlayVideo();
  const reducedMotion = usePrefersReducedMotion();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-neutral-800 transition-all ${scrolled ? 'bg-neutral-950/90' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <Link to="/" className="text-3xl font-extrabold tracking-tight">
              Zailon<span className="text-emerald-400">Auto</span>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              <a href="#beneficios" className="text-neutral-300 hover:text-emerald-400 transition">Benefícios</a>
              <a href="#solucao" className="text-neutral-300 hover:text-emerald-400 transition">Como Funciona</a>
              <a href="#resultados" className="text-neutral-300 hover:text-emerald-400 transition">Resultados</a>
              <a href="#planos" className="text-neutral-300 hover:text-emerald-400 transition">Planos</a>
              <a href="#faq" className="text-neutral-300 hover:text-emerald-400 transition">Dúvidas</a>

              {loading ? (
                <span className="text-neutral-500">Carregando...</span>
              ) : user ? (
                <button onClick={logout} className="text-emerald-400 hover:text-emerald-300 transition">
                  Sair
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-neutral-300 hover:text-emerald-400 transition">
                    Login
                  </Link>
                  <Link to="/signup" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium text-white transition">
                    Criar conta
                  </Link>
                </>
              )}
            </nav>

            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </header>

        <main className="pt-28 pb-32 md:pb-20"> {/* Aumentei pb para dar espaço ao sticky CTA */}
          {/* HERO */}
          <section ref={heroRef} className="relative overflow-hidden py-20 px-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-cyan-600/10 to-transparent pointer-events-none" />

            <motion.div
              style={{ y: yHero }}
              className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"
            >
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.span
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
                >
                  <Car className="w-4 h-4 text-emerald-400" /> Pré-vendas automático
                </motion.span>

                <motion.h1
                  variants={fadeInUp}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
                >
                  Seu vendedor que <span className="text-emerald-400">nunca dorme</span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mt-6 text-xl text-neutral-400 max-w-xl leading-relaxed"
                >
                  Atende 24/7 no WhatsApp, qualifica leads, coleta dados e entrega apenas contatos quentes para você colocar **mais grana no bolso**.
                </motion.p>

                <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-5">
                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <Link
                      to={loading || !user ? '/signup' : '/sistema'}
                      className="inline-flex items-center gap-3 px-8 py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-bold text-lg shadow-lg shadow-emerald-900/30"
                    >
                      {loading ? "Verificando..." : user ? "Acessar Sistema" : "Começar Agora"} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover="hover" initial="rest" variants={cardHover}>
                    <button
                      onClick={() => window.open("https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20Zailon%20Auto.%20Pode%20me%20chamar%20por%20aqui?", "_blank")}
                      className="inline-flex items-center gap-3 px-8 py-5 rounded-xl border border-neutral-700 hover:bg-neutral-800/50 transition font-bold text-lg"
                    >
                      Agendar Demonstração <PlayCircle className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Mockup com vídeo principal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900/80 overflow-hidden shadow-2xl shadow-black/40"
                >
                  <div className="h-12 bg-neutral-950/80 backdrop-blur flex items-center px-5 gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500/80" />
                    <div className="w-4 h-4 rounded-full bg-yellow-500/80" />
                    <div className="w-4 h-4 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-sm text-neutral-400">Zailon Auto Dashboard</span>
                  </div>
                  <video
                    ref={registerVideo}
                    src={dashboardVideo}
                    poster={posters.dashboard}
                    className="w-full aspect-video object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* Benefícios */}
          <section id="beneficios" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Por que o Zailon Auto coloca **mais grana no seu bolso**
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <MessageCircle className="w-10 h-10" />,
                  title: 'Primeiro atendimento automático',
                  desc: 'Responde 24/7 e coleta dados sem custo extra — mais leads, mais grana no bolso.'
                },
                {
                  icon: <ShieldCheck className="w-10 h-10" />,
                  title: 'Vendedor só fala com quem importa',
                  desc: 'Leads quentes direto para fechar — menos conversa fiada, mais vendas no bolso.'
                },
                {
                  icon: <BarChart3 className="w-10 h-10" />,
                  title: 'Pré-vendas organizado',
                  desc: 'Histórico completo no CRM — feche mais rápido e aumente o faturamento.'
                },
                {
                  icon: <Zap className="w-10 h-10" />,
                  title: 'Prioridade por qualidade',
                  desc: 'Dashboard mostra o que gera receita — foque no que coloca dinheiro no bolso.'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                  variants={cardHover}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8"
                >
                  <motion.div variants={iconHover} className="text-emerald-400 mb-6 group-hover:scale-110 transition">
                    {item.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-neutral-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Como Funciona */}
          <section id="solucao" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Como o Zailon Auto coloca mais grana no seu bolso
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: <MessageCircle className="w-12 h-12" />,
                  title: 'Cliente se autoatende',
                  desc: 'Formulários captam interesse, pagamento e fotos — leads prontos para faturar mais.',
                  video: formularioVideo,
                  poster: posters.formulario
                },
                {
                  icon: <Bot className="w-12 h-12" />,
                  title: 'Sistema qualifica o lead',
                  desc: 'Filtra curiosos e entrega só quem quer comprar — mais fechamentos, mais dinheiro.',
                  video: dashboardVideo,
                  poster: posters.dashboard
                },
                {
                  icon: <CheckCircle className="w-12 h-12" />,
                  title: 'Vendedor entra no momento certo',
                  desc: 'Card completo no CRM — vendedor foca em vender, não em triar. Mais grana no bolso.',
                  video: crmVideo,
                  poster: posters.relatorio
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                  variants={cardHover}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden"
                >
                  <div className="p-8">
                    <motion.div variants={iconHover} className="text-emerald-400 mb-6">
                      {item.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-neutral-400 mb-6">{item.desc}</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-neutral-950"
                  >
                    <video
                      ref={registerVideo}
                      src={item.video}
                      poster={item.poster}
                      className="w-full aspect-video object-cover"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Resultados */}
          <section id="resultados" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Resultados que colocam mais grana no bolso
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Metric value="-60%" label="tempo respondendo WhatsApp (mais tempo para vender)" />
              <Metric value="+3x" label="leads quentes (mais vendas no bolso)" />
              <Metric value="24h" label="ativação do sistema que fatura por você" />
            </div>
          </section>

          {/* Planos */}
          <section id="planos" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
                Assine o Zailon Auto e coloque mais grana no bolso
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-xl text-neutral-400 mb-12">
                Por apenas <span className="text-emerald-400 font-bold">R$ 99/mês</span> você tem o sistema completo.
                <br />
                Com menos de <span className="font-bold">1 venda/mês</span> já se paga e sobra lucro.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="max-w-2xl mx-auto rounded-3xl border border-emerald-800/30 bg-gradient-to-br from-neutral-900 to-neutral-950 p-12 shadow-2xl shadow-emerald-900/20"
              >
                <h3 className="text-3xl font-bold mb-6">Zailon Auto</h3>
                <p className="text-xl text-neutral-300 mb-8">
                  Pré-vendas + CRM automotivo completo — mais vendas, menos esforço
                </p>

                <div className="mb-10">
                  <span className="text-6xl font-extrabold text-emerald-400 animate-pulse">R$ 99</span>
                  <span className="text-2xl text-neutral-400"> /mês</span>
                  <p className="text-sm text-neutral-500 mt-2">Sem fidelidade • Cancele quando quiser</p>
                </div>

                <ul className="space-y-4 mb-12 text-left text-neutral-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> Formulários + Pré-vendas + CRM + Dashboard
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> Suporte por e-mail
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> Ativação em até 24h
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> Sem fidelidade
                  </li>
                </ul>

                <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="block w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xl text-center transition shadow-lg shadow-emerald-900/30"
                  >
                    Assinar Agora
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* FAQ */}
          <section id="faq" className="max-w-7xl mx-auto px-6 py-24 border-t border-neutral-800">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Perguntas Frequentes
            </motion.h2>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  q: 'Quem fala com o cliente primeiro?',
                  a: 'O Zailon Auto faz o primeiro atendimento via WhatsApp, coletando dados essenciais antes de envolver o vendedor — mais tempo para fechar vendas e colocar grana no bolso.'
                },
                {
                  q: 'Os vendedores param de responder WhatsApp?',
                  a: 'Eles param de responder curiosos. Só entram quando o lead já está qualificado — mais vendas, menos conversa fiada, mais dinheiro no bolso.'
                },
                {
                  q: 'Preciso de conhecimento técnico?',
                  a: 'Não. Configuramos o fluxo inicial e você acompanha pelo dashboard simples — foco total em vender e faturar mais.'
                },
                {
                  q: 'Tem fidelidade?',
                  a: 'Não. Assinatura mensal, cancele quando quiser — teste sem risco e veja a grana entrar.'
                }
              ].map((item, i) => (
                <FaqItem
                  key={i}
                  question={item.q}
                  answer={item.a}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </section>

          {/* Sticky CTA mobile – corrigido e responsivo */}
          <div className="md:hidden fixed inset-x-4 bottom-6 z-50 flex gap-4 max-w-md mx-auto pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-0"
            >
              <Link
                to={loading || !user ? '/signup' : '/sistema'}
                className="block w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-center text-base shadow-lg shadow-emerald-900/40 transition"
              >
                Começar Agora
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-0"
            >
              <button
                onClick={() => window.open("https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20Zailon%20Auto.", "_blank")}
                className="block w-full py-4 px-6 border border-neutral-700 hover:bg-neutral-800/50 rounded-xl font-bold text-center text-base transition shadow-md"
              >
                WhatsApp
              </button>
            </motion.div>
          </div>
        </main>

        <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-6 text-center text-neutral-500">
          <p>© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
}

export default LeadFlow;