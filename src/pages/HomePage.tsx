// src/pages/HomePage.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- VÍDEOS (na mesma pasta) ---
import formularioVideo from './Formulario.mp4';
import relatorioVideo from './Relatorio.mp4';
import crmVideo from './CRMKanban.mp4';
import dashboardVideo from './dash.mp4';

const posters = {
  formulario: '/posters/formulario.jpg',
  relatorio: '/posters/relatorio.jpg',
  crm: '/posters/crm.jpg',
  dashboard: '/posters/dashboard.jpg',
};

// ------------------------- Util: A11y & Scroll -------------------------
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

// ------------------------- AutoPlay Videos on Scroll -------------------------
const useAutoPlayVideo = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const registerVideo = useCallback((el: HTMLVideoElement | null) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    if (videoRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -15% 0px',
      }
    );

    videoRefs.current.forEach((video) => video && observer.observe(video));

    return () => {
      videoRefs.current.forEach((video) => video && observer.unobserve(video));
      observer.disconnect();
    };
  }, []);

  return registerVideo;
};

// ------------------------- FAQ Item -------------------------
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
      className="bg-white rounded-2xl shadow border border-gray-100 p-6 transition-all hover:shadow-lg"
    >
      <button
        id={btnId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onClick}
        className="w-full text-left flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1"
      >
        <span className="font-semibold text-gray-900 text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-amber-500"
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
    try {
      await logout();
      setOpen(false);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { label: 'A Solução', id: 'solucao' },
    { label: 'Como Funciona', id: 'crm' },
    { label: 'Preços', id: 'planos' },
    { label: 'Dúvidas', id: 'faq' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-amber-600 hover:bg-zinc-100 hover:border-amber-400/50 transition-all shadow-sm"
        aria-label="Abrir menu"
      >
        <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-amber-200 flex items-center justify-center">
          <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <Feather.Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-4/5 max-w-[300px] h-full p-0 bg-white border-r border-zinc-200 flex flex-col z-50"
        overlayClassName="bg-black/60"
      >
        <SheetTitle className="sr-only">Menu Principal</SheetTitle>
        <SheetDescription className="sr-only">Navegue pelas seções do site.</SheetDescription>

        <div className="flex items-center gap-3 p-6 border-b border-zinc-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md">
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-zinc-700 hover:bg-amber-500/10 hover:border-amber-400/50 transition-all border border-transparent"
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
                className="w-full flex items-center justify-start gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-100 transition-all rounded-xl"
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

// ------------------------- HomePage -------------------------
const HomePage = () => {
  const { user, loading, logout } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrolled = useScrollHeader(60);
  const registerVideo = useAutoPlayVideo();
  const reducedMotion = usePrefersReducedMotion();

  const fadeInUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
  };

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

      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Helmet>
          <title>ZailonSoft - Formulários Inteligentes para Concessionárias</title>
          <meta name="description" content="Capte propostas completas, gerencie no CRM visual e acompanhe tudo no dashboard. Acelere suas vendas." />
          <link rel="icon" href="/Favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

          <link rel="preload" href="/CamaroBranco.png" as="image" fetchpriority="high" />
          <link rel="preload" href="/BannerCamaro.png" as="image" fetchpriority="high" />

          <style>{`
            .hero-section {
              background: linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.78)),
                          url('/CamaroBranco.png') center/cover no-repeat !important;
              min-height: 100vh;
              display: flex;
              align-items: center;
            }
            @media (min-width: 1024px) {
              .hero-section {
                background-image: linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.78)),
                                   url('/BannerCamaro.png') !important;
              }
            }
            body, html { font-family: 'Inter', sans-serif; }
          `}</style>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        {/* HEADER */}
        <header
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-white">Zailon</span>
              <span className="text-amber-500">Soft</span>
            </Link>

            <nav className="hidden md:flex gap-8 items-center text-lg font-medium">
              {[
                { label: 'A Solução', id: 'solucao' },
                { label: 'Como Funciona', id: 'crm' },
                { label: 'Preços', id: 'planos' },
                { label: 'Dúvidas', id: 'faq' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition ${
                    !scrolled ? 'text-white hover:text-amber-400' : 'text-gray-700 hover:text-amber-500'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {loading ? (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Feather.Loader size={16} className="animate-spin" /> Carregando...
                </span>
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="text-amber-500 hover:text-amber-600 flex items-center gap-2 font-medium"
                >
                  <Feather.LogOut size={16} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link to="/login" className="text-amber-500 hover:text-amber-600 font-medium">Login</Link>
                  <Link
                    to="/signup"
                    className="bg-amber-500 text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition shadow-sm"
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

        {/* HERO - VENDAS IRRESISTÍVEL */}
        <main id="conteudo">
          <section className="hero-section pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
                  Pare de Perder Vendas para <span className="text-amber-400">Curiosos</span> que Somem
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow">
                  Clientes perguntam, somem ou fazem propostas irreais? ZailonSoft transforma curiosos em propostas qualificadas 24h por dia, automatizando a captação de dados reais – tipo de negociação, carro de troca com imagens, e tudo mastigado no CRM para você fechar a venda.
                </motion.p>
                <motion.p variants={fadeInUp} className="text-xl text-emerald-300 mb-10 max-w-3xl mx-auto drop-shadow">
                  Capte leads reais, exporte PDF pronto para o banco, e veja seu estoque se mover – sem esforço manual.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link
                    to={loading || !user ? '/signup' : '/sistema'}
                    className="inline-flex items-center gap-3 bg-amber-500 text-zinc-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition shadow-lg"
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
                        Comece Agora e Acelere Suas Vendas <Feather.ArrowRight size={20} />
                      </>
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* SEÇÃO DOR + SOLUÇÃO */}
          <section className="py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto text-center">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
                Você Perde Vendas Todo Dia Sem Saber
              </motion.h2>
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                Clientes perguntam e somem. Curiosos fazem propostas irreais. Captação manual rouba seu tempo. ZailonSoft resolve isso – automatizando tudo para você focar no fechamento.
              </motion.p>

              <div className="grid md:grid-cols-3 gap-10">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="p-6 bg-red-50 rounded-2xl shadow">
                  <h3 className="text-2xl font-bold text-red-600 mb-4">Dor 1: Clientes Somem</h3>
                  <p className="text-gray-600">Perguntam preço e desaparecem. Com ZailonSoft, capture dados completos 24h – tipo de negociação, carro de troca com fotos – e transforme curiosos em leads qualificados.</p>
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="p-6 bg-red-50 rounded-2xl shadow">
                  <h3 className="text-2xl font-bold text-red-600 mb-4">Dor 2: Propostas Irreais</h3>
                  <p className="text-gray-600">Propostas não palpáveis desperdiçam tempo. Nosso formulário inteligente filtra e qualifica, enviando só dados reais para o CRM – pronto para exportar em PDF e fechar.</p>
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="p-6 bg-red-50 rounded-2xl shadow">
                  <h3 className="text-2xl font-bold text-red-600 mb-4">Dor 3: Captação Manual</h3>
                  <p className="text-gray-600">Gaste menos tempo anotando. Automatize captação: à vista, financiamento, troca com imagens. Compartilhe catálogo, cliente responde direto – tudo vai para o CRM e dashboard em tempo real.</p>
                </motion.div>
              </div>

              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="mt-16">
                <Link to="/signup" className="inline-flex items-center gap-3 bg-amber-500 text-zinc-900 px-10 py-5 rounded-xl font-bold text-xl hover:bg-amber-600 transition shadow-xl">
                  Resolva Essas Dores Agora – Comece Grátis <Feather.ArrowRight size={24} />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* SEÇÃO DE SOLUÇÃO - COM VÍDEOS AUTO-PLAY */}
          <section id="solucao" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
                <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-6">
                  Veja Como ZailonSoft <span className="text-amber-500">Transforma Suas Vendas</span>
                </h2>
                <p className="text-xl text-gray-600 text-center mb-20 max-w-4xl mx-auto leading-relaxed">
                  Automatize a captação 24h, qualifique leads reais, exporte PDFs mastigados e feche mais negócios – sem esforço manual.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-10">
                {[
                  {
                    icon: Feather.FileText,
                    title: 'Formulários que Convertem Curiosos em Compradores',
                    desc: 'Capte dados completos automatically: tipo de negociação, carro de troca com fotos. Adeus a propostas irreais – tudo vai direto para o CRM.',
                    video: formularioVideo,
                    poster: posters.formulario,
                  },
                  {
                    icon: Feather.BarChart2,
                    title: 'Dashboard que Mostra Tudo em Tempo Real',
                    desc: 'Controle total: funil de vendas, valor em negociação e desempenho. Veja leads chegando 24h e tome decisões que escalam seu negócio.',
                    video: dashboardVideo,
                    poster: posters.dashboard,
                  },
                  {
                    icon: Feather.UserCheck,
                    title: 'Propostas Prontas para Fechar Vendas',
                    desc: 'Relatórios exportados em PDF, mastigados para o banco. Edite dados no CRM e entre em contato só com leads quentes.',
                    video: relatorioVideo,
                    poster: posters.relatorio,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500"></div>
                    <div className="p-8">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 transition-transform">
                        <item.icon size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                    </div>

                    {/* VÍDEO AUTO-PLAY - RODA SEM HOVER/CLICK */}
                    <div className="relative overflow-hidden bg-gray-900">
                      <video
                        ref={registerVideo}
                        src={item.video}
                        poster={item.poster}
                        className="w-full h-64 md:h-72 object-cover transition-opacity duration-500"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <p className="text-white font-medium text-center">Veja o sistema rodando agora</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SEÇÃO CRM - PERSUASÃO */}
          <section id="crm" className="py-24 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">De Proposta a Venda em <span className="text-emerald-500">Minutos</span></h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Pare de perder tempo com captação manual. ZailonSoft automatiza tudo: envie catálogo, cliente responde direto, dados vão para o CRM – edite, exporte PDF e feche.
                </p>
                <ul className="space-y-5 text-lg">
                  <li className="flex items-center gap-4"><Feather.CheckCircle className="text-emerald-600" size={28} /> Captação 24h, mesmo enquanto você dorme</li>
                  <li className="flex items-center gap-4"><Feather.CheckCircle className="text-emerald-600" size={28} /> Catálogo integrado – cliente vê e propõe</li>
                  <li className="flex items-center gap-4"><Feather.CheckCircle className="text-emerald-600" size={28} /> CRM com edição e export PDF mastigado</li>
                  <li className="flex items-center gap-4"><Feather.CheckCircle className="text-emerald-600" size={28} /> Dashboard real-time – veja leads e vendas crescendo</li>
                </ul>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition mt-10"
                >
                  Comece Agora e Pare de Perder Vendas <Feather.ArrowRight size={20} />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <video
                  ref={registerVideo}
                  src={crmVideo}
                  poster={posters.crm}
                  className="rounded-3xl shadow-2xl w-full"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </motion.div>
            </div>
          </section>

          {/* PLANOS - PERSUASÃO */}
          <section id="planos" className="py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-12">
                Invista no Seu Crescimento – <span className="text-amber-500">Escolha Seu Plano</span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                {/* PRO */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover:shadow-2xl transition-shadow"
                >
                  <h3 className="text-3xl font-black text-gray-900 mb-3">ZailonSoft Pro</h3>
                  <p className="text-gray-600 mb-8 text-lg">Autonomia total para crescer – capture leads 24h e feche mais.</p>
                  <div className="mb-8">
                    <span className="text-6xl font-black text-gray-900">R$ 299</span>
                    <span className="text-xl text-gray-500 font-normal">/mês</span>
                  </div>
                  <ul className="space-y-5 mb-10 text-gray-700">
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={24} /> Formulários + CRM + Dashboard</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={24} /> Suporte por e-mail</li>
                  </ul>
                  <Link to="/signup" className="block text-center bg-amber-500 text-zinc-900 py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 transition shadow-md">
                    Assinar Pro e Acelerar Vendas
                  </Link>
                </motion.div>

                {/* PREMIUM */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden hover:shadow-3xl transition-shadow"
                >
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-sm font-bold px-5 py-2 rounded-bl-xl">
                    MAIS VENDIDO
                  </div>
                  <h3 className="text-3xl font-black mb-3">ZailonSoft Premium</h3>
                  <p className="mb-8 text-lg opacity-90">Nós cuidamos do operacional – você foca no fechamento.</p>
                  <div className="mb-8">
                    <span className="text-6xl font-black">R$ 499</span>
                    <span className="text-xl font-normal opacity-75">/mês</span>
                  </div>
                  <ul className="space-y-5 mb-10">
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={24} /> Tudo do Pro</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={24} /> <strong>Suporte via WhatsApp</strong></li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={24} /> <strong>Nós cadastramos seus veículos</strong></li>
                  </ul>
                  <a
                    href="https://wa.me/554691163405?text=Olá!%20Quero%20assinar%20o%20plano%20ZailonSoft%20Premium%20(R$%20499/mês)%20com%20suporte%20prioritário%20e%20gestão%20de%20veículos."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-white text-amber-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-md flex items-center justify-center gap-3"
                  >
                    <Feather.MessageCircle size={24} /> Assinar via WhatsApp
                  </a>
                </motion.div>
              </div>

              <p className="text-center text-gray-500 mt-12 text-sm">
                Ambos os planos são mensais e sem fidelidade. Cancele quando quiser.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-12">
                Perguntas Frequentes
              </motion.h2>
              <div className="space-y-6">
                {[
                  { q: 'Como o formulário sabe quais carros oferecer?', a: 'Conectamos ao seu catálogo. Links diretos pré-preenchem o carro.' },
                  { q: 'Preciso de técnico?', a: 'Não. Tudo é feito para donos e vendedores.' },
                  { q: 'O que acontece após o preenchimento?', a: 'A proposta vira um card no CRM. Vendedor é notificado.' },
                  { q: 'Tem fidelidade?', a: 'Não. Mensal e cancelável a qualquer momento.' },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} initial="hidden" whileInView="visible">
                    <FaqItem question={item.q} answer={item.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white border-t border-gray-200 py-12 px-4 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;