// src/pages/HomePage.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';

// --- VÍDEOS (mesma pasta deste arquivo) ---
import formularioVideo from './Formulario.mp4';
import relatorioVideo from './Relatorio.mp4';
import crmVideo from './CRMKanban.mp4';
import dashboardVideo from './dash.mp4';

// (Opcional) pôsteres dos vídeos para evitar tela preta no primeiro frame
const posters = {
  formulario: '/posters/formulario.jpg',
  relatorio: '/posters/relatorio.jpg',
  crm: '/posters/crm.jpg',
  dashboard: '/posters/dashboard.jpg',
};

// ------------------------- Util: Animações & A11y -------------------------
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

const useScrollHeader = (offset = 50) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
};

// Pausa/retoma vídeos conforme visibilidade (economia de CPU/bateria)
const useSmartVideo = () => {
  const refs = useRef<HTMLVideoElement[]>([]);
  const register = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    if (!refs.current.includes(el)) refs.current.push(el);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            v.play().catch(() => void 0);
          } else {
            v.pause();
          }
        }),
      { threshold: 0.25 }
    );
    refs.current.forEach((v) => obs.observe(v));
    return () => obs.disconnect();
  }, []);
  return register;
};

// ------------------------- Fundo com “dots” leves -------------------------
const LightDotsBackground = () => {
  const [dots, setDots] = useState<any[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const n = reduced ? 20 : 70;
    const newDots = Array.from({ length: n }).map(() => ({
      id: Math.random(),
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 8 + 8}s`,
      animationDelay: `${Math.random() * 8}s`,
      size: `${Math.random() * 2 + 1}px`,
      opacity: `${Math.random() * 0.4 + 0.3}`,
    }));
    setDots(newDots);
  }, [reduced]);

  return (
    <>
      <style>
        {`
          @keyframes move-dots {
            from { transform: translateY(0px); }
            to { transform: translateY(-1500px); }
          }
          .light-dot {
            animation: move-dots linear infinite;
            position: absolute;
            background-color: #a1a1aa;
            border-radius: 50%;
            z-index: -20;
          }
          @media (prefers-reduced-motion: reduce) {
            .light-dot { animation: none; }
          }
        `}
      </style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="light-dot"
            style={{
              top: dot.top,
              left: dot.left,
              animationDuration: dot.animationDuration,
              animationDelay: dot.animationDelay,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
};

const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px] opacity-[0.08]"></div>
    <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c760,transparent)]"></div>
  </div>
);

// FAQ Item acessível
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
  const panelId = useMemo(() => `faq-panel-${btoa(question).replace(/=/g, '')}`, [question]);
  const btnId = `${panelId}-btn`;
  return (
    <motion.div
      layout
      className="bg-zinc-700/50 p-4 rounded-lg border border-zinc-600 hover:border-amber-400/50 transition-colors duration-300 shadow-sm backdrop-blur-sm"
    >
      <div className="w-full text-left flex justify-between items-center">
        <button
          id={btnId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onClick}
          className="flex-1 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md"
        >
          <span className="text-lg font-medium text-white">{question}</span>
          <motion.span
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
            aria-hidden="true"
          >
            <Feather.Plus size={22} className="text-amber-500" />
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            key={`answer-${panelId}`}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="text-zinc-300 whitespace-pre-line">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ------------------------- Página -------------------------
const HomePage = () => {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrolled = useScrollHeader(50);
  const videoRef = useSmartVideo();
  const reducedMotion = usePrefersReducedMotion();

  // Fechar menu com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reducedMotion ? 0 : 0.2 },
    },
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' },
    },
  };

  // JSON-LD básico
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ZailonSoft',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: '299',
      url: 'https://zailonsoft.com', // ajuste se necessário
    },
  };

  return (
    <HelmetProvider>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-amber-400 focus:text-zinc-900 focus:px-3 focus:py-2 focus:rounded">
        Pular para o conteúdo
      </a>
      <div className="min-h-screen bg-zinc-900 text-zinc-200 font-montserrat relative overflow-x-hidden">
        <Helmet>
          <title>ZailonSoft - Transforme Cliques em Vendas de Veículos</title>
          <meta
            name="description"
            content="Otimize a captação de leads e propostas de financiamento com formulários inteligentes. Entregue negociações prontas para seus vendedores e acelere suas vendas."
          />
          <meta property="og:title" content="ZailonSoft - Formulários Inteligentes para Concessionárias" />
          <meta
            property="og:description"
            content="Capte propostas de financiamento completas, com dados de troca e informações do cliente, e gerencie tudo em um CRM visual."
          />
          <link rel="icon" type="image/x-icon" href="/Favicon.ico" />
          {/* Imagens da hero: mobile primeiro, desktop em >=1024px */}
          <link rel="preload" href="/BannerCamaro.png" as="image" media="(min-width: 1024px)" fetchpriority="high" />
          <link rel="preload" href="/CamaroBranco.png" as="image" media="(max-width: 1023px)" />
          <style>{`
            .hero-section {
              background-image:
                linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
                url(/CamaroBranco.png);
            }
            @media (min-width: 1024px) {
              .hero-section {
                background-image:
                  linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
                  url(/BannerCamaro.png);
              }
            }
          `}</style>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap"
            rel="stylesheet"
          />
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        <LightDotsBackground />

        {/* Header */}
        <header
          className={`fixed top-0 left-0 w-full z-50 transition-all ${
            scrolled ? 'backdrop-blur bg-zinc-900/70 border-b border-white/10' : 'bg-transparent'
          }`}
          role="banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
            <Link to="/" className="text-2xl font-extrabold tracking-wider text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">
              Zailon<span className="text-white">Soft</span>
            </Link>

            <nav
              className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-14 left-0 w-full md:w-auto bg-zinc-900/95 md:bg-transparent items-center gap-4 md:gap-6 p-4 md:p-0`}
              aria-label="Menu principal"
            >
              <a href="#solucao" onClick={() => setIsMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 transition-colors">
                A Solução
              </a>
              <a href="#crm" onClick={() => setIsMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 transition-colors">
                Como Funciona
              </a>
              <a href="#planos" onClick={() => setIsMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 transition-colors">
                Preços
              </a>
              <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 transition-colors">
                Dúvidas
              </a>
              <div className="h-6 w-px bg-zinc-600 hidden md:block" aria-hidden="true" />
              {loading ? (
                <span className="text-zinc-400 flex items-center gap-2">
                  <Feather.Loader size={18} className="animate-spin" /> Verificando...
                </span>
              ) : user ? (
                <motion.button
                  onClick={handleLogout}
                  className="text-amber-400 hover:text-amber-500 transition-all flex items-center gap-2"
                  whileHover={{ scale: reducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: reducedMotion ? 1 : 0.97 }}
                >
                  <Feather.LogOut size={18} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-amber-400 hover:text-amber-500 transition-all flex items-center gap-2"
                  >
                    <Feather.LogIn size={18} /> Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-amber-400 text-zinc-900 px-5 py-2 rounded-full font-semibold hover:bg-amber-500 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                  >
                    Criar Conta <Feather.UserPlus size={18} />
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded p-1"
              aria-label="Alternar menu"
              aria-expanded={isMenuOpen}
              aria-controls="menu-principal"
            >
              {isMenuOpen ? <Feather.X size={28} /> : <Feather.Menu size={28} />}
            </button>
          </div>
        </header>

        {/* HERO */}
        <main id="conteudo">
          <section
            id="inicio"
            className="hero-section relative w-full min-h-screen flex items-center justify-center pt-24 bg-cover bg-center"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
                  Converta Visitantes em <span className="text-amber-400">Propostas Reais.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-xl mb-10 text-zinc-300">
                  Pare de coletar apenas contatos. Receba propostas de financiamento completas com nosso formulário inteligente
                  e envie para o banco em minutos.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link
                    to={loading || !user ? '/signup' : '/sistema'}
                    className="inline-flex items-center justify-center gap-2 bg-amber-400 text-zinc-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                  >
                    {loading ? (
                      <>
                        <Feather.Loader size={22} className="animate-spin" /> Verificando...
                      </>
                    ) : user ? (
                      <>
                        Acessar Sistema <Feather.ArrowRight size={22} />
                      </>
                    ) : (
                      <>
                        Comece Agora <Feather.ArrowRight size={22} />
                      </>
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* BLOCO PRINCIPAL */}
          <div className="relative">
            <AnimatedBackground />

            {/* A Solução */}
            <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-800/80">
              <div className="max-w-7xl mx-auto text-center">
                <motion.h2
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-white"
                >
                  A Solução Inteligente em Ação
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-xl text-amber-400 mt-2 mb-20"
                >
                  Veja como cada ferramenta foi desenhada para maximizar suas vendas.
                </motion.p>

                {/* Feature 1: Formulário */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid md:grid-cols-2 gap-12 items-center mb-20 text-left"
                >
                  <motion.div variants={fadeInUp}>
                    <video
                      ref={videoRef}
                      src={formularioVideo}
                      poster={posters.formulario}
                      className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-amber-400/10 p-3 rounded-full">
                        <Feather.FileText className="text-amber-400" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Formulários que Convertem</h3>
                    </div>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                      Nosso formulário dinâmico guia o cliente passo a passo, coletando todos os dados para a ficha de financiamento:
                      informações pessoais, veículo de interesse, dados de troca e proposta de pagamento.
                    </p>
                  </motion.div>
                </motion.div>

                {/* Feature 2: Dashboard */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid md:grid-cols-2 gap-12 items-center mb-20 text-left"
                >
                  <motion.div variants={fadeInUp} className="md:order-last">
                    <video
                      ref={videoRef}
                      src={dashboardVideo}
                      poster={posters.dashboard}
                      className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-amber-400/10 p-3 rounded-full">
                        <Feather.BarChart2 className="text-amber-400" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Dashboard com Inteligência</h3>
                    </div>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                      Visão 360º do seu negócio: propostas recebidas, taxa de conversão e desempenho da equipe em tempo real.
                      Métricas visuais para decisões mais rápidas e estratégicas.
                    </p>
                  </motion.div>
                </motion.div>

                {/* Feature 3: Relatório do Cliente */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid md:grid-cols-2 gap-12 items-center text-left"
                >
                  <motion.div variants={fadeInUp}>
                    <video
                      ref={videoRef}
                      src={relatorioVideo}
                      poster={posters.relatorio}
                      className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-amber-400/10 p-3 rounded-full">
                        <Feather.UserCheck className="text-amber-400" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Propostas Prontas para Análise</h3>
                    </div>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                      Adeus fichas à mão. Cada lead qualificado gera um relatório completo e organizado, pronto para o banco — sem fricção.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* CRM */}
            <section id="crm" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/80">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">DE PROPOSTA A VENDA</h2>
                  <p className="text-xl text-amber-400 mt-2 mb-6">Transforme Fichas em Carros Entregues</p>
                  <p className="text-zinc-300 text-lg leading-relaxed">
                    Com a proposta já qualificada no CRM, o vendedor foca no que importa: negociar, aprovar o crédito e fechar.
                    Mais agilidade, mais conversão, menos tarefas manuais.
                  </p>
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <video
                    ref={videoRef}
                    src={crmVideo}
                    poster={posters.crm}
                    className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                </motion.div>
              </div>
            </section>

            {/* Planos */}
            <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-800/80">
              <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-white"
                >
                  INVESTIMENTO INTELIGENTE
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-xl text-zinc-300 mt-2 mb-12"
                >
                  Um plano simples. Resultados completos.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-zinc-700/50 p-8 rounded-xl shadow-xl shadow-amber-400/10 backdrop-blur-sm"
                >
                  <h3 className="text-2xl font-semibold text-white mb-2">ZailonSoft Pro</h3>
                  <p className="text-zinc-400 mb-6">Tudo que você precisa para otimizar e escalar suas vendas.</p>
                  <p className="text-5xl font-bold text-white mb-4">
                    R$ 299<span className="text-xl text-zinc-400">/mês</span>
                  </p>
                  <ul className="text-left space-y-3 my-8 max-w-sm mx-auto text-zinc-300">
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> Formulários de Proposta Inteligentes
                    </li>
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> Leads 100% Qualificados com dados
                    </li>
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> Catálogo de Veículos Integrado
                    </li>
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> CRM Visual para Gestão de Vendas
                    </li>
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> Dashboard e Relatórios de Desempenho
                    </li>
                    <li className="flex items-center gap-3">
                      <Feather.CheckCircle size={20} className="text-amber-400" /> Suporte Prioritário
                    </li>
                  </ul>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-amber-400 text-zinc-900 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                  >
                    Assinar e Acelerar Minhas Vendas
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/80">
              <div className="max-w-3xl mx-auto">
                <motion.h2
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-12 text-center text-white"
                >
                  Perguntas Frequentes
                </motion.h2>
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {[
                    {
                      question: 'Como o formulário sabe quais carros oferecer?',
                      answer:
                        'Conectamos ao seu Catálogo de Veículos. Você pode gerar um link de proposta para um carro específico e o formulário já abre pré-preenchido.',
                    },
                    {
                      question: 'Preciso ter conhecimento técnico?',
                      answer:
                        'Não. É feito para donos de loja e vendedores. Cuidamos da parte técnica para você focar no que importa: vender.',
                    },
                    {
                      question: 'O que acontece depois que o cliente preenche o formulário?',
                      answer:
                        'A proposta completa aparece no CRM como um novo card no funil. O vendedor é notificado e já pode dar andamento na análise de crédito e negociação.',
                    },
                    {
                      question: 'Existe contrato de fidelidade?',
                      answer:
                        'Não. O plano é mensal e você pode cancelar quando quiser. Preferimos reter pelo resultado, não pela obrigação.',
                    },
                  ].map((item, i) => (
                    <motion.div key={i} variants={fadeInUp}>
                      <FaqItem
                        question={item.question}
                        answer={item.answer}
                        isOpen={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          </div>
        </main>

        <footer className="bg-zinc-800 py-8 px-4 sm:px-6 lg:px-8 text-center border-t border-zinc-600">
          <p className="text-zinc-400 text-sm">© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;
