// src/pages/HomePage.tsx — Layout claro, clean, com hero recriado e Premium destacado
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
  <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
    <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{value}</p>
    <p className="text-gray-600 mt-1">{label}</p>
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
    <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <button
        id={btnId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onClick}
        className="w-full text-left flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1"
      >
        <span className="font-semibold text-gray-900 text-lg">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-amber-500">
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
            className="mt-4 text-gray-600 leading-relaxed"
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
    try { await logout(); setOpen(false); navigate('/login'); } catch (e) { console.error(e); }
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-amber-600 hover:bg-zinc-100 transition shadow-sm"
        aria-label="Abrir menu"
      >
        <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-amber-200 grid place-items-center">
          <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <Feather.Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-4/5 max-w-[320px] h-full p-0 bg-white border-r border-zinc-200 flex flex-col z-50" overlayClassName="bg-black/40">
        <SheetTitle className="sr-only">Menu Principal</SheetTitle>
        <SheetDescription className="sr-only">Navegue pelas seções do site.</SheetDescription>
        <div className="flex items-center gap-3 p-6 border-b border-zinc-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow">
            <img src="/favicon.ico" alt="ZailonSoft" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">
              Zailon<span className="text-amber-500">Soft</span>
            </h1>
            <p className="text-xs text-zinc-500">CRM Automotivo</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="space-y-2 p-4">
            {menuItems.map((item) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-zinc-700 hover:bg-amber-50 transition border border-transparent"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Feather.ChevronRight className="w-5 h-5 text-amber-500" />
                <span className="font-medium">{item.label}</span>
              </motion.a>
            ))}
          </nav>
          <div className="p-4 border-t border-zinc-100">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Feather.Loader size={16} className="animate-spin" /> Carregando...
              </div>
            ) : user ? (
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 transition rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Feather.LogOut className="w-5 h-5 text-zinc-500" />
                <span className="font-medium">Sair</span>
              </motion.button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-amber-500 text-zinc-900 font-bold hover:bg-amber-600 transition mb-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition"
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
    return () => { document.documentElement.style.scrollBehavior = ''; };
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
      { '@type': 'Offer', price: '299', priceCurrency: 'BRL', name: 'ZailonSoft Pro' },
      { '@type': 'Offer', price: '499', priceCurrency: 'BRL', name: 'ZailonSoft Premium' },
    ],
  };

  return (
    <HelmetProvider>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-amber-500 focus:text-zinc-900 focus:px-4 focus:py-2 focus:rounded-lg">
        Pular para conteúdo
      </a>

      <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
        <Helmet>
          <html lang="pt-BR" />
          <title>ZailonSoft — Leads prontos para fechar automaticamente</title>
          <meta name="description" content="Transforme mensagens em propostas completas. Formulários inteligentes, CRM visual e dashboard em tempo real — ativo em 24h." />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <style>{`
            :root { color-scheme: light; }
            .hero-soft {
              background:
                radial-gradient(800px 300px at 10% 0%, rgba(255, 214, 102, .18), transparent 60%),
                radial-gradient(800px 300px at 90% 0%, rgba(16, 185, 129, .16), transparent 60%),
                linear-gradient(#ffffff,#f9fafb);
            }
            .mockup-frame {
              box-shadow:
                0 1px 2px rgba(0,0,0,.04),
                0 12px 24px rgba(0,0,0,.08);
            }
          `}</style>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        {/* HEADER */}
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-black tracking-tight">
              <span className={`${scrolled ? 'text-zinc-900' : 'text-zinc-900'}`}>Zailon</span>
              <span className="text-amber-500">Soft</span>
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
                  className={`transition ${scrolled ? 'text-gray-800 hover:text-amber-600' : 'text-gray-800 hover:text-amber-600'}`}
                >
                  {item.label}
                </a>
              ))}
              {loading ? (
                <span className="text-sm flex items-center gap-2 text-gray-500">
                  <Feather.Loader size={16} className="animate-spin" /> Carregando...
                </span>
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 font-medium text-amber-600 hover:text-amber-700"
                >
                  <Feather.LogOut size={16} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700">Login</Link>
                  <Link
                    to="/signup"
                    className="bg-amber-500 text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition shadow-sm"
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
        <main id="conteudo">
          {/* HERO — novo, clean */}
          <section ref={heroRef as any} className="hero-soft pt-24 pb-8 md:pt-28 md:pb-16">
            <motion.div style={{ y: yHero }} className="relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
                {/* Texto */}
                <motion.div variants={stagger} initial="hidden" animate="visible">
                  <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                    Leads <span className="text-amber-500">prontos para fechar</span> automaticamente
                  </motion.h1>
                  <motion.p variants={fadeInUp} className="mt-5 text-lg md:text-xl text-gray-600 max-w-2xl">
                    O ZailonSoft capta, qualifica e organiza tudo no CRM. Você recebe propostas completas com negociação, fotos do carro de troca e intenção real.
                  </motion.p>

                  <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={loading || !user ? '/signup' : '/sistema'}
                      className="inline-flex items-center justify-center gap-3 bg-amber-500 text-zinc-900 px-6 py-3 rounded-xl font-bold text-lg hover:bg-amber-400 transition shadow-sm"
                    >
                      {loading ? (
                        <>Verificando <Feather.Loader className="animate-spin" size={20} /></>
                      ) : user ? (
                        <>Acessar Sistema <Feather.ArrowRight size={20} /></>
                      ) : (
                        <>Comece Agora <Feather.ArrowRight size={20} /></>
                      )}
                    </Link>

                    <a
                      href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20ZailonSoft.%20Pode%20me%20chamar%20por%20aqui%3F"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Falar no WhatsApp para marcar uma demonstração"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                    >
                      <Feather.PlayCircle size={20} /> Ver demonstração
                    </a>
                  </motion.div>

                  <motion.ul variants={fadeInUp} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <li className="flex items-center gap-2 text-gray-600"><Feather.CheckCircle className="text-emerald-600" size={18}/> +70% propostas completas</li>
                    <li className="flex items-center gap-2 text-gray-600"><Feather.CheckCircle className="text-emerald-600" size={18}/> Zero planilha manual</li>
                    <li className="flex items-center gap-2 text-gray-600"><Feather.CheckCircle className="text-emerald-600" size={18}/> Ativo em 24h</li>
                  </motion.ul>
                </motion.div>

                {/* Mockup clean */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative">
                  <div className="bg-white rounded-3xl border border-gray-200 mockup-frame overflow-hidden">
                    <div className="h-10 border-b border-gray-200 flex items-center gap-2 px-4">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-xs text-gray-500">ZailonSoft — CRM</span>
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
          
          <section id="beneficios" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 text-center mb-12">Por que o ZailonSoft vende mais</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Feather.UserCheck, title: 'Leads qualificados', copy: 'Captação 24/7 com negociação e troca (fotos).' },
                  { icon: Feather.Edit, title: 'Menos atrito', copy: 'Cliente preenche direto no formulário sem perguntas repetidas.' },
                  { icon: Feather.FolderPlus, title: 'CRM pronto', copy: 'Propostas viram cards editáveis com PDF pro banco.' },
                  { icon: Feather.BarChart2, title: 'Visão total', copy: 'Dashboard em tempo real do funil e dos vendedores.' },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 grid place-items-center mb-4">
                      <c.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-gray-600">{c.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COMO FUNCIONA */}
          <section id="solucao" className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-14">Como funciona</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Feather.FileText,
                    title: 'Formulários que convertem',
                    desc: 'Negociação + fotos da troca. Vai direto ao CRM.',
                    video: formularioVideo,
                    poster: posters.formulario,
                  },
                  {
                    icon: Feather.BarChart2,
                    title: 'Dashboard em tempo real',
                    desc: 'Funil, valores e desempenho por vendedor.',
                    video: dashboardVideo,
                    poster: posters.dashboard,
                  },
                  {
                    icon: Feather.UserCheck,
                    title: 'Propostas prontas',
                    desc: 'PDF mastigado pro banco. Entre só para fechar.',
                    video: crmVideo,
                    poster: posters.relatorio,
                  },
                ].map((item, i) => (
                  <article key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-7">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 grid place-items-center mb-4">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.desc}</p>
                    </div>
                    <div className="relative bg-gray-100">
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

          {/* RESULTADOS / PROVAS */}
          <section id="resultados" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-12">Resultados reais</h2>
              <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Metric value="+70%" label="média de aumento em propostas completas" />
                <Metric value="24h" label="tempo para começar a captar automaticamente" />
                <Metric value="R$ 0" label="fidelidade ou taxa de cancelamento" />
              </div>

              {/* <div className="mt-12 grid md:grid-cols-3 gap-6">
                {[
                  { name: 'Léo, Gestor de Vendas', quote: 'Em 2 semanas dobramos propostas que fazem sentido. O time foca em fechar.', store: 'Concessionária Regional' },
                  { name: 'Cíntia, Diretora', quote: 'Chega com entrada, fotos da troca e dados certos. O CRM já vem pronto.', store: 'Multimarcas Centro' },
                  { name: 'Renan, Vendedor', quote: 'PDF mastigado pro banco e adeus pedir info básica.', store: 'Auto Car' },
                ].map((t, i) => (
                  <blockquote key={i} className="p-7 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">“{t.quote}”</p>
                    <footer className="mt-4 text-sm text-gray-600">
                      <strong className="text-gray-900">{t.name}</strong> • {t.store}
                    </footer>
                  </blockquote>
                ))}
              </div> */}
            </div>
          </section>

          {/* PLANOS — Premium destacado */}
          <section id="planos" className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-4">
                Escolha seu plano
              </h2>
              <p className="text-center text-gray-600 mb-12">
                Com menos que <strong>1 venda/mês</strong> o ZailonSoft já se paga.
              </p>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* PRO — propositalmente mais discreto */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">ZailonSoft Pro</h3>
                  <p className="text-gray-600 mb-8 text-lg">Autonomia para crescer — capture leads 24h e feche mais.</p>
                  <div className="mb-8">
                    <span className="text-6xl font-black text-gray-900">R$ 299</span>
                    <span className="text-xl text-gray-500 font-normal">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-10 text-gray-700">
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={20}/> Formulários + CRM + Dashboard</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={20}/> Suporte por e-mail</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={20}/> Ativação em até 24h</li>
                  </ul>
                  <Link
                    to="/signup"
                    className="block text-center bg-white text-gray-900 border border-gray-300 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition"
                  >
                    Assinar Pro
                  </Link>
                  <p className="mt-4 text-sm text-gray-500">Sem fidelidade • Cancele quando quiser</p>
                </div>

                {/* PREMIUM — SUPER DESTAQUE */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative group rounded-3xl p-[2px] bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 shadow-[0_20px_60px_rgba(234,179,8,0.35)]"
                >
                  {/* Glow suave ao redor */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-amber-200/0 via-amber-400/0 to-orange-500/0 blur-2xl group-hover:from-amber-200/30 group-hover:via-amber-400/20 group-hover:to-orange-500/20 transition"></div>

                  {/* Ribbon */}
                  <div className="absolute -top-3 right-5 z-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-white text-xs font-bold px-3 py-1 shadow">
                      <Feather.Star size={14} /> MAIS VENDIDO
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="relative rounded-[22px] bg-white p-10 h-full border border-amber-500/10">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900">ZailonSoft Premium</h3>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 rounded-full px-2.5 py-1">
                        ROI mais rápido
                      </span>
                    </div>

                    <p className="text-gray-700 mt-3 mb-8 text-lg">
                      Nós cuidamos do operacional — você foca no fechamento.
                    </p>

                    <div className="mb-8">
                      <span className="text-6xl font-black text-gray-900">R$ 499</span>
                      <span className="text-xl text-gray-500 font-normal">/mês</span>
                      <p className="text-sm text-gray-500 mt-1">Menos que 1 venda/mês e já se paga</p>
                    </div>

                    <ul className="space-y-3 mb-10 text-gray-800">
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-600" size={20} /> Tudo do Pro
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-600" size={20} /> <strong>Suporte via WhatsApp</strong>
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-600" size={20} /> <strong>Nós cadastramos seus veículos</strong>
                      </li>
                      <li className="flex items-center gap-3">
                        <Feather.CheckCircle className="text-emerald-600" size={20} /> <strong>Onboarding assistido</strong>
                      </li>
                    </ul>

                    {/* CTA principal com gradiente */}
                    <a
                      href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20assinar%20o%20plano%20ZailonSoft%20Premium%20(R$%20499/mês)."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center rounded-2xl font-bold text-lg py-4
                                bg-gradient-to-r from-amber-300 via-amber-500 to-orange-600
                                text-zinc-900 shadow-md hover:shadow-lg transition"
                    >
                      Assinar Premium no WhatsApp
                    </a>

                    {/* Garantia / prova */}
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Sem taxa de setup • Sem fidelidade • Ativação em até 24h
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-12">Perguntas Frequentes</h2>
              <div className="space-y-6">
                {[
                  { q: 'Como o formulário sabe quais carros oferecer?', a: 'Integramos ao seu catálogo, links diretos pré-preenchem o carro.' },
                  { q: 'Preciso de conhecimento técnico?', a: 'Não, foi desenvolvido exclusivamente para lojas de veículos, abrangendo tanto proprietários quanto vendedores.' },
                  { q: 'O que acontece após o preenchimento?', a: 'A proposta vira card no CRM e o vendedor apenas entra para fechar negócio.' },
                  { q: 'Tem fidelidade?', a: 'Não. Mensal e cancelável a qualquer momento.' },
                ].map((item, i) => (
                  <FaqItem key={i} question={item.q} answer={item.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
            </div>
          </section>

          {/* sticky CTA mobile */}
          <div className="md:hidden fixed bottom-3 inset-x-3 z-50 grid grid-cols-2 gap-3">
            <Link to={loading || !user ? '/signup' : '/sistema'} className="text-center px-4 py-3 rounded-xl font-bold bg-amber-500 text-zinc-900 shadow">Começar</Link>
            <a href="https://wa.me/554691163405?text=Ol%C3%A1!%20Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20ZailonSoft.%20Pode%20me%20chamar%20por%20aqui%3F" target="_blank" rel="noopener noreferrer" className="text-center px-4 py-3 rounded-xl font-bold bg-white border border-gray-300 text-gray-900 shadow">WhatsApp</a>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
            <nav className="flex items-center gap-5 text-sm text-gray-500">
              <a href="#planos" className="hover:text-amber-600">Planos</a>
              <a href="#faq" className="hover:text-amber-600">Dúvidas</a>
              <Link to="/login" className="hover:text-amber-600">Login</Link>
            </nav>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;
