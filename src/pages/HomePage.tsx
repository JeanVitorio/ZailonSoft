// src/pages/HomePage.tsx — Versão DARK, com "O Verdinho" (Emerald) e copy ajustada
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- VÍDEOS (na mesma pasta) ---
import formularioVideo from './Formulario.mp4';
import crmVideo from './CRMKanban.mp4';
import dashboardVideo from './dash.mp4';

const posters = {
  formulario: '/posters/formulario.jpg',
  relatorio: '/posters/relatorio.jpg',
  crm: '/posters/crm.jpg',
  dashboard: '/posters/dashboard.jpg',
};

// ------------------------- Utils -------------------------
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

// ------------------------- Primitives -------------------------
const Metric = ({ value, label }: { value: string; label: string }) => (
  <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.6)]">
    <p className="text-3xl md:text-4xl font-black text-slate-50 tracking-tight">{value}</p>
    <p className="text-slate-300 mt-1">{label}</p>
  </div>
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
  const panelId = useMemo(() => `faq-${btoa(question).replace(/=/g, '')}`, [question]);
  const btnId = `${panelId}-btn`;
  return (
    <motion.div
      layout
      className="bg-slate-900/70 rounded-2xl shadow-[0_18px_40px_rgba(15,23,42,0.6)] border border-slate-800 p-6"
    >
      <button
        id={btnId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onClick}
        className="w-full text-left flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 -m-1"
      >
        <span className="font-semibold text-slate-50 text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-emerald-400"
        >
          <Feather.Plus size={24} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 text-slate-300 leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ------------------------- Mobile Menu -------------------------
const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
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
      <SheetTrigger
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-emerald-400 hover:bg-slate-800 transition shadow-sm"
        aria-label="Abrir menu"
      >
        <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 border border-emerald-400/60 grid place-items-center">
          <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <Feather.Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-4/5 max-w-[320px] h-full p-0 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 flex flex-col z-50"
        overlayClassName="bg-black/70"
      >
        <SheetTitle className="sr-only">Menu Principal</SheetTitle>
        <SheetDescription className="sr-only">Navegue pelas seções do site.</SheetDescription>
        <div className="flex items-center gap-3 p-6 border-b border-slate-800 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-emerald-400/70 grid place-items-center">
            <img src="/favicon.ico" alt="ZailonSoft" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-50">
              Zailon<span className="text-emerald-400">Soft</span>
            </h1>
            <p className="text-xs text-slate-400">CRM Automotivo</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="space-y-2 p-4">
            {menuItems.map((item) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-100 hover:bg-slate-800/80 transition border border-transparent"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Feather.ChevronRight className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">{item.label}</span>
              </motion.a>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Feather.Loader size={16} className="animate-spin" /> Carregando...
              </div>
            ) : user ? (
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 transition rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Feather.LogOut className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Sair</span>
              </motion.button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition mb-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-slate-900 text-slate-50 font-bold hover:bg-slate-800 transition border border-slate-600"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ------------------------- Página -------------------------
const HomePage = () => {
  const { user, loading, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrolled = useScrollHeader(60);
  const registerVideo = useAutoPlayVideo();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Parallax hero (leve)
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

  const fadeInUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  } as const;
  const stagger = { visible: { transition: { staggerChildren: 0.12 } } } as const;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ZailonSoft',
    applicationCategory: 'BusinessApplication',
    offers: [
      { '@type': 'Offer', price: '99', priceCurrency: 'BRL', name: 'ZailonSoft' },
    ],
  };

  return (
    <HelmetProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Pular para conteúdo
      </a>

      {/* Fundo de gradiente animado que pulsa */}
      <div className="background-gradient-animation" />
      <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
        <Helmet>
          <html lang="pt-BR" />
          <title>ZailonSoft — Pré-vendas automático para sua loja de veículos</title>
          <meta
            name="description"
            content="ZailonSoft faz o primeiro atendimento dos leads, coleta dados, qualifica e só envia para o vendedor quem realmente tem intenção de comprar. Seu pré-vendas automático no WhatsApp."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <style>{`
            :root { color-scheme: dark; }
            .hero-gradient {
              background:
                radial-gradient(800px 300px at 10% 0%, rgba(16, 185, 129, .12), transparent 60%),
                radial-gradient(800px 300px at 90% 0%, rgba(6, 182, 212, .15), transparent 60%);
            }
            .mockup-frame {
              box-shadow:
                0 0 0 1px rgba(15,23,42,0.8),
                0 24px 70px rgba(0,0,0,0.90);
            }
            /* Fundo de gradiente dinâmico (Vibe Dashboard) */
            .background-gradient-animation {
              --color-1: 16, 185, 129;  /* Emerald */
              --color-2: 6, 182, 212;   /* Cyan */
              --color-3: 15, 23, 42;    /* Slate */
              --color-4: 14, 165, 233;  /* Sky */
              --color-5: 34, 197, 94;   /* Green */
            
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              z-index: 0; 
              opacity: 0.15; 
              filter: blur(120px); 
              transform: translate3d(0, 0, 0); 
              pointer-events: none; 
            }
            
            .background-gradient-animation::before {
              content: "";
              position: absolute;
              width: 200vw;
              height: 200vh;
              top: -50vh;
              left: -50vw;
              background: radial-gradient(circle at var(--x1) var(--y1), rgba(var(--color-1), 0.7) 0%, transparent 50%),
                          radial-gradient(circle at var(--x2) var(--y2), rgba(var(--color-2), 0.7) 0%, transparent 50%),
                          radial-gradient(circle at var(--x3) var(--y3), rgba(var(--color-4), 0.7) 0%, transparent 50%),
                          radial-gradient(circle at var(--x4) var(--y4), rgba(var(--color-5), 0.7) 0%, transparent 50%),
                          radial-gradient(circle at var(--x5) var(--y5), rgba(var(--color-1), 0.7) 0%, transparent 50%);
              background-blend-mode: screen;
              animation: gradient-animation 25s ease infinite; 
              will-change: transform;
            }
            
            @keyframes gradient-animation {
              0% { --x1: 20%; --y1: 20%; --x2: 70%; --y2: 80%; --x3: 40%; --y3: 10%; --x4: 80%; --y4: 30%; --x5: 10%; --y5: 90%; }
              20% { --x1: 80%; --y1: 10%; --x2: 30%; --y2: 70%; --x3: 60%; --y3: 90%; --x4: 20%; --y4: 50%; --x5: 90%; --y5: 20%; }
              40% { --x1: 10%; --y1: 70%; --x2: 90%; --y2: 20%; --x3: 5%; --y3: 80%; --x4: 70%; --y4: 10%; --x5: 30%; --y5: 60%; }
              60% { --x1: 70%; --y1: 5%; --x2: 10%; --y2: 95%; --x3: 90%; --y3: 40%; --x4: 5%; --y4: 70%; --x5: 80%; --y5: 10%; }
              80% { --x1: 30%; --y1: 80%; --x2: 60%; --y2: 10%; --x3: 10%; --y3: 50%; --x4: 95%; --y4: 80%; --x5: 40%; --y5: 5%; }
              100% { --x1: 20%; --y1: 20%; --x2: 70%; --y2: 80%; --x3: 40%; --y3: 10%; --x4: 80%; --y4: 30%; --x5: 10%; --y5: 90%; }
            }
            /* Pulso Sutil para CTAs (Neurociência) */
            @keyframes pulse-emerald {
              0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
              }
              70% {
                transform: scale(1.02);
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
              }
            }
            .pulse-emerald {
              animation: pulse-emerald 2.5s infinite;
            }
            
            /* Gradiente animado da borda */
            @keyframes animate-gradient-border {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animated-gradient-border {
              background-size: 300% 300% !important;
              animation: animate-gradient-border 4s ease infinite;
            }
          `}</style>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        {/* HEADER */}
        <header
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80'
              : 'bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-black tracking-tight">
              <span className="text-slate-50">Zailon</span>
              <span className="text-emerald-400">Soft</span>
            </Link>

            <nav className="hidden md:flex gap-8 items-center text-base font-medium">
              {[
                { label: 'Benefícios', id: 'beneficios' },
                { label: 'Como Funciona', id: 'solucao' },
                { label: 'Resultados', id: 'resultados' },
                { label: 'Planos', id: 'planos' },
                { label: 'Dúvidas', id: 'faq' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-slate-300 hover:text-emerald-400 transition"
                >
                  {item.label}
                </a>
              ))}
              {loading ? (
                <span className="text-sm flex items-center gap-2 text-slate-400">
                  <Feather.Loader size={16} className="animate-spin" /> Carregando...
                </span>
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 font-medium text-emerald-400 hover:text-emerald-300"
                >
                  <Feather.LogOut size={16} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-400 transition shadow-sm"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </nav>

            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main id="conteudo" className="relative z-10">
          {/* HERO — foco em pré-vendas */}
          <section ref={heroRef as any} className="hero-gradient pt-24 pb-8 md:pt-28 md:pb-16">
            <motion.div style={{ y: yHero }} className="relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
                {/* Texto */}
                <motion.div variants={stagger} initial="hidden" animate="visible">
                  <motion.h1
                    variants={fadeInUp}
                    className="text-4xl md:text-6xl font-black text-slate-50 tracking-tight"
                  >
                    Seu pré-vendas automático
                    <span className="text-emerald-300"> atende e filtra os leads</span>
                  </motion.h1>
                  <motion.p variants={fadeInUp} className="mt-5 text-lg md:text-xl text-slate-300 max-w-2xl">
                    O ZailonSoft faz o primeiro atendimento, coleta dados, qualifica e só entrega para o vendedor os leads
                    que realmente têm intenção de comprar. Seu time de vendas foca em fechar, não em responder todo mundo
                    no WhatsApp.
                  </motion.p>

                  <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={loading || !user ? '/signup' : '/sistema'}
                      className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-lg hover:bg-emerald-400 transition shadow-[0_18px_40px_rgba(16,185,129,0.55)] pulse-emerald"
                    >
                      {loading ? (
                        <>
                          Verificando <Feather.Loader className="animate-spin" size={20} />
                        </>
                      ) : user ? (
                        <>
                          Acessar Sistema <Feather.ArrowRight size={20} />
                        </>
                      ) : (
                        <>
                          Comece Agora <Feather.ArrowRight size={20} />
                        </>
                      )}
                    </Link>

                    <a
                      href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20ZailonSoft.%20Pode%20me%20chamar%20por%20aqui%3F"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Falar no WhatsApp para marcar uma demonstração"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800 transition"
                    >
                      <Feather.PlayCircle size={20} /> Ver demonstração
                    </a>
                  </motion.div>

                  <motion.ul variants={fadeInUp} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <li className="flex items-center gap-2 text-slate-300">
                      <Feather.CheckCircle className="text-emerald-400" size={18} />
                      Vendedores só com leads quentes
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Feather.CheckCircle className="text-emerald-400" size={18} />
                      Atendimento 24/7 sem aumentar equipe
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Feather.CheckCircle className="text-emerald-400" size={18} />
                      Sem responder um por um no WhatsApp
                    </li>
                  </motion.ul>
                </motion.div>

                {/* Mockup dark */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative">
                  <div className="bg-slate-900 rounded-3xl border border-slate-700 mockup-frame overflow-hidden">
                    <div className="h-10 border-b border-slate-800 bg-slate-950/70 flex items-center gap-2 px-4">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-xs text-slate-400">ZailonSoft — Pré-vendas & CRM</span>
                    </div>
                    <video
                      ref={registerVideo}
                      src={dashboardVideo}
                      poster={posters.crm}
                      className="w-full aspect-video object-cover"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* BENEFÍCIOS — focados em pré-vendas */}
          <section id="beneficios" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-slate-50 text-center mb-12">
                {/* ✅ Frase Ajustada */}
                Por que o ZailonSoft <span className="text-emerald-300">potencializa</span> seu time de vendas
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Feather.MessageCircle,
                    title: 'Primeiro atendimento automático',
                    copy: 'O sistema responde, coleta dados e faz a triagem inicial dos leads, sem depender de um vendedor online.',
                  },
                  {
                    icon: Feather.UserCheck,
                    title: 'Vendedor só fala com quem importa',
                    copy: 'Leads são qualificados antes. Só chegam para o vendedor quando têm intenção clara de compra.',
                  },
                  {
                    icon: Feather.FolderPlus,
                    title: 'Pré-vendas organizado',
                    copy: 'Cada atendimento vira card no CRM com histórico, dados do cliente e informações da troca.',
                  },
                  {
                    icon: Feather.BarChart2,
                    title: 'Prioridade por qualidade',
                    copy: 'Dashboard mostra onde o pré-vendas está travando e quais leads merecem o foco do time.',
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/70 rounded-2xl border border-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.6)] p-7"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-300 grid place-items-center mb-4 border border-slate-700">
                      <c.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-2">{c.title}</h3>
                    <p className="text-slate-300">{c.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COMO FUNCIONA — fluxo de pré-vendas */}
          <section id="solucao" className="py-20 px-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-slate-50 mb-14">
                Como funciona o pré-vendas
              </h2>
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Feather.FileText,
                    title: 'O cliente se autoatende',
                    desc: 'Formulários e fluxos captam interesse, condições de pagamento e fotos da troca — sem vendedor digitando.',
                    video: formularioVideo,
                    poster: posters.formulario,
                  },
                  {
                    icon: Feather.Filter,
                    title: 'O sistema qualifica o lead',
                    desc: 'Os dados entram no pré-vendas, você enxerga quem está só curioso e quem realmente está pronto para avançar.',
                    video: dashboardVideo,
                    poster: posters.dashboard,
                  },
                  {
                    icon: Feather.UserCheck,
                    title: 'Só então entra o vendedor',
                    desc: 'Quando o lead atinge o nível certo, vira card no CRM, com tudo preenchido, para o vendedor só negociar e fechar.',
                    video: crmVideo,
                    poster: posters.relatorio,
                  },
                ].map((item, i) => (
                  <article
                    key={i}
                    className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.8)] overflow-hidden"
                  >
                    <div className="p-7">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-300 grid place-items-center mb-4 border border-slate-700">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-50 mb-2">{item.title}</h3>
                      <p className="text-slate-300 mb-4">{item.desc}</p>
                    </div>
                    <div className="relative bg-slate-900">
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
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* RESULTADOS / PROVAS — focados em tempo de vendedor */}
          <section id="resultados" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-slate-50 mb-12">
                Resultados no seu pré-vendas
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Metric value="-60%" label="tempo dos vendedores gasto respondendo WhatsApp" />
                <Metric value="+3x" label="mais leads realmente prontos para falar com o vendedor" />
                <Metric value="24h" label="para ter seu pré-vendas automático rodando" />
              </div>
            </div>
          </section>

          {/* PLANO ÚNICO */}
          <section id="planos" className="py-20 px-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-slate-50 mb-4">
                Assine o ZailonSoft
              </h2>
              <p className="text-center text-slate-300 mb-12">
                Por apenas <strong>R$ 99/mês</strong> você tem acesso completo ao sistema de pré-vendas e CRM automotivo.
                <br />
                Com menos que <strong>1 venda/mês</strong> o ZailonSoft já se paga.
              </p>

              <div className="max-w-2xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative group rounded-3xl p-[2px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-[0_24px_70px_rgba(245,158,11,0.65)] animated-gradient-border"
                >
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-amber-300/25 via-amber-500/20 to-orange-400/25 blur-2xl group-hover:from-amber-300/40 group-hover:via-amber-500/30 group-hover:to-orange-400/30 transition"></div>

                  <div className="relative rounded-[22px] bg-slate-950 text-slate-50 p-10 border border-amber-400/60 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 -translate-x-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                      aria-hidden="true"
                    />

                    <h3 className="text-2xl md:text-3xl font-black text-slate-50 mb-2">
                      ZailonSoft
                    </h3>

                    <p className="text-slate-100/90 mt-3 mb-8 text-lg">
                      Sistema completo de pré-vendas e CRM automotivo. Formulários, funis, dashboard e muito mais.
                    </p>

                    <div className="mb-8">
                      <span className="text-6xl font-black text-slate-50">R$ 99</span>
                      <span className="text-xl text-slate-400 font-normal">/mês</span>
                      <p className="text-sm text-slate-400 mt-1">Sem fidelidade • Cancele quando quiser</p>
                    </div>

                    <ul className="space-y-3 mb-10 text-slate-50/95">
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-300" size={20} />
                        Formulários + Pré-vendas + CRM + Dashboard
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-300" size={20} />
                        Suporte por e-mail
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-300" size={20} />
                        Ativação em até 24h
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-300" size={20} />
                        Sem fidelidade • Cancele quando quiser
                      </li>
                    </ul>

                    <Link
                      to="/signup"
                      className="block text-center bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-slate-950 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_22px_60px_rgba(245,158,11,0.9)] transition"
                    >
                      Assinar Agora
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* FAQ — dúvidas sobre pré-vendas */}
          <section id="faq" className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-slate-50 mb-12">
                Perguntas Frequentes
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: 'Quem fala com o cliente primeiro?',
                    a: 'O primeiro atendimento é feito pelo ZailonSoft, através de formulários e fluxos pensados para loja de veículos. Ele coleta as informações essenciais antes de envolver um vendedor.',
                  },
                  {
                    q: 'Os vendedores param de responder WhatsApp?',
                    a: 'Eles deixam de responder curiosos e quem ainda não sabe o que quer. Com o ZailonSoft, o vendedor entra na conversa quando o lead já está qualificado e com dados completos.',
                  },
                  {
                    q: 'Preciso de conhecimento técnico?',
                    a: 'Não. O sistema foi desenhado para o dia a dia de multimarcas e concessionárias. Nós ajudamos a configurar o fluxo de pré-vendas e você só acompanha.',
                  },
                  {
                    q: 'Tem fidelidade?',
                    a: 'Não. A assinatura é mensal e você pode cancelar a qualquer momento.',
                  },
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
            </div>
          </section>

          {/* sticky CTA mobile */}
          <div className="md:hidden sticky bottom-3 inset-x-3 z-50 grid grid-cols-2 gap-3">
            <Link
              to={loading || !user ? '/signup' : '/sistema'}
              className="text-center px-4 py-3 rounded-xl font-bold bg-emerald-500 text-slate-950 shadow-lg"
            >
              Começar
            </Link>
            <a
              href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20ZailonSoft.%20Pode%20me%20chamar%20por%20aqui%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center px-4 py-3 rounded-xl font-bold bg-slate-900 border border-slate-700 text-slate-50 shadow"
            >
              WhatsApp
            </a>
          </div>
        </main>

        <footer className="relative z-10 bg-slate-950/90 backdrop-blur-sm border-t border-slate-900 py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.
            </p>
            <nav className="flex items-center gap-5 text-sm text-slate-500">
              <a href="#planos" className="hover:text-emerald-300">
                Planos
              </a>
              <a href="#faq" className="hover:text-emerald-300">
                Dúvidas
              </a>
              <Link to="/login" className="hover:text-emerald-300">
                Login
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;