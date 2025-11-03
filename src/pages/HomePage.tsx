// src/pages/HomePage.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';

// --- VÍDEOS ---
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

const useSmartVideo = () => {
  const refs = useRef<HTMLVideoElement[]>([]);
  const register = useCallback((el: HTMLVideoElement | null) => {
    if (!el || refs.current.includes(el)) return;
    refs.current.push(el);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          e.isIntersecting ? v.play().catch(() => {}) : v.pause();
        }),
      { threshold: 0.3 }
    );
    refs.current.forEach((v) => obs.observe(v));
    return () => obs.disconnect();
  }, []);

  return register;
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
      className="bg-white rounded-2xl shadow border border-gray-100 p-5 transition-all hover:shadow-md"
    >
      <button
        id={btnId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onClick}
        className="w-full text-left flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 -m-1"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-amber-500"
        >
          <Feather.Plus size={20} />
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
            transition={{ duration: 0.2 }}
            className="mt-3 text-gray-600 text-sm leading-relaxed"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ------------------------- HomePage -------------------------
const HomePage = () => {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrolled = useScrollHeader(60);
  const videoRef = useSmartVideo();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error(err); }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

          {/* PRÉ-CARREGAMENTO OTIMIZADO DO CAMARO (NÃO REMOVIDO!) */}
          <link
            rel="preload"
            href="@BannerCamaro.png"
            as="image"
            type="image/webp"
            media="(max-width: 1023px)"
            fetchpriority="high"
          />
          <link
            rel="preload"
            href="/BannerCamaro.png"
            as="image"
            type="image/webp"
            media="(min-width: 1024px)"
            fetchpriority="high"
          />
          {/* Fallback PNG (caso webp falhe) */}
          <link
            rel="preload"
            href="/CamaroBranco.png"
            as="image"
            media="(max-width: 1023px)"
            fetchpriority="high"
          />
          <link
            rel="preload"
            href="/BannerCamaro.png"
            as="image"
            media="(min-width: 1024px)"
            fetchpriority="high"
          />

          <style>{`
            .hero-section {
              background: linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.78)),
                          url(/CamaroBranco.webp) center/cover no-repeat;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
            @media (min-width: 1024px) {
              .hero-section {
                background-image: linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.78)),
                                   url(/BannerCamaro.png);
              }
            }
            /* Fallback para navegadores sem WebP */
            @media not all and (min-width: 0\\0), not all and (min-resolution: 0.001dpcm) {
              .hero-section {
                background-image: linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.78)),
                                   url(/CamaroBranco.png);
              }
              @media (min-width: 1024px) {
                .hero-section {
                  background-image: linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.78)),
                                     url(/BannerCamaro.png);
                }
              }
            }
            body, html { font-family: 'Inter', sans-serif; }
          `}</style>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>

        {/* Header */}
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

            <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-lg md:shadow-none p-6 md:p-0 gap-6 items-center text-lg font-medium`}>
              {[
                { label: 'A Solução', id: 'solucao' },
                { label: 'Como Funciona', id: 'crm' },
                { label: 'Preços', id: 'planos' },
                { label: 'Dúvidas', id: 'faq' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`transition ${
                    !scrolled && !isMenuOpen
                      ? 'text-white hover:text-amber-400'
                      : 'text-gray-700 hover:text-amber-500'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px w-full bg-gray-200 md:hidden" />
              {loading ? (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Feather.Loader size={16} className="animate-spin" /> Carregando...
                </span>
              ) : user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="text-amber-500 hover:text-amber-600 flex items-center gap-2 font-medium"
                >
                  <Feather.LogOut size={16} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-amber-500 hover:text-amber-600 font-medium">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-amber-500 text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition shadow-sm"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(v => !v)}
              className={`md:hidden ${!scrolled && !isMenuOpen ? 'text-white' : 'text-amber-500'}`}
              aria-label="Menu"
            >
              {isMenuOpen ? <Feather.X size={28} /> : <Feather.Menu size={28} />}
            </button>
          </div>
        </header>

        {/* HERO COM CAMARO NO FUNDO (OTIMIZADO!) */}
        <main id="conteudo">
          <section className="hero-section min-h-screen flex items-center justify-center pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
                  Converta <span className="text-amber-400">Visitantes</span> em <span className="text-emerald-400">Propostas Reais</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow">
                  Formulários que captam dados completos. CRM visual. Dashboard com inteligência.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link
                    to={loading || !user ? '/signup' : '/sistema'}
                    className="inline-flex items-center gap-3 bg-amber-500 text-zinc-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition shadow-lg"
                  >
                    {loading ? (
                      <>Verificando <Feather.Loader className="animate-spin" size={20} /></>
                    ) : user ? (
                      <>Acessar Sistema <Feather.ArrowRight size={20} /></>
                    ) : (
                      <>Começar Agora <Feather.ArrowRight size={20} /></>
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* === RESTANTE DO CÓDIGO (igual ao anterior) === */}
          {/* Solução */}
          <section id="solucao" className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
                A Solução Completa em Ação
              </motion.h2>
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">
                Do primeiro clique até a entrega das chaves — tudo em um só lugar.
              </motion.p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: Feather.FileText, title: 'Formulários que Convertem', desc: 'Captura cliente, carro, troca e financiamento em um fluxo simples.', video: formularioVideo },
                  { icon: Feather.BarChart2, title: 'Dashboard Inteligente', desc: 'Funil de vendas, valor em negociação e desempenho da equipe.', video: dashboardVideo },
                  { icon: Feather.UserCheck, title: 'Propostas Prontas', desc: 'Relatórios organizados, prontos para análise no banco.', video: relatorioVideo },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden group"
                  >
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
                    <div className="p-6">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                    <video
                      ref={videoRef}
                      src={item.video}
                      poster={posters.formulario}
                      className="w-full h-48 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      muted
                      loop
                      playsInline
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CRM */}
          <section id="crm" className="py-20 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">De Proposta a Venda</h2>
                <p className="text-lg text-gray-600 mb-6">
                  A proposta já vem qualificada. O vendedor foca em negociar e fechar.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3"><Feather.Check className="text-emerald-600" /> 9 etapas no funil</li>
                  <li className="flex items-center gap-3"><Feather.Check className="text-emerald-600" /> Notificações instantâneas</li>
                  <li className="flex items-center gap-3"><Feather.Check className="text-emerald-600" /> Histórico completo</li>
                </ul>
              </motion.div>
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <video
                  ref={videoRef}
                  src={crmVideo}
                  poster={posters.crm}
                  className="rounded-2xl shadow-xl w-full"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              </motion.div>
            </div>
          </section>

          {/* Planos */}
          <section id="planos" className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                Planos Simples. Resultados Reais.
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Pro */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  className="bg-white rounded-2xl shadow border border-gray-100 p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">ZailonSoft Pro</h3>
                  <p className="text-gray-600 mb-6">Autonomia total para crescer.</p>
                  <p className="text-5xl font-black text-gray-900 mb-6">R$ 299 <span className="text-xl text-gray-500 font-normal">/mês</span></p>
                  <ul className="space-y-3 mb-8 text-gray-700">
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={20} /> Formulários + CRM + Dashboard</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle className="text-emerald-600" size={20} /> Suporte por e-mail</li>
                  </ul>
                  <Link to="/signup" className="block text-center bg-amber-500 text-zinc-900 py-3 rounded-xl font-bold hover:bg-amber-600 transition">
                    Assinar Pro
                  </Link>
                </motion.div>

                {/* Premium */}
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    MAIS VENDIDO
                  </div>
                  <h3 className="text-2xl font-bold mb-2">ZailonSoft Premium</h3>
                  <p className="mb-6 opacity-90">Nós cuidamos do operacional.</p>
                  <p className="text-5xl font-black mb-6">R$ 499 <span className="text-xl font-normal opacity-75">/mês</span></p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={20} /> Tudo do Pro</li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={20} /> <strong>Suporte via WhatsApp</strong></li>
                    <li className="flex items-center gap-3"><Feather.CheckCircle size={20} /> <strong>Nós cadastramos seus veículos</strong></li>
                  </ul>
                  <a
                    href="https://wa.me/554691163405?text=Olá!%20Quero%20assinar%20o%20plano%20ZailonSoft%20Premium%20(R$%20499/mês)%20com%20suporte%20prioritário%20e%20gestão%20de%20veículos."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-white text-amber-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Feather.MessageCircle size={20} /> Assinar via WhatsApp
                  </a>
                </motion.div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-10">
                Ambos os planos são mensais e sem fidelidade. Cancele quando quiser.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-20 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                Perguntas Frequentes
              </motion.h2>
              <div className="space-y-4">
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

        <footer className="bg-white border-t border-gray-200 py-8 px-4 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} ZailonSoft. Todos os direitos reservados.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;