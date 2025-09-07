import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';
import DashboardImage from './Dashboard.png'; // Importando a imagem

// Componente para pontos de luz animados
const LightDotsBackground = () => {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const generateDots = () => {
      const newDots = Array.from({ length: 70 }).map(() => ({
        id: Math.random(),
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 8 + 8}s`,
        animationDelay: `${Math.random() * 8}s`,
        size: `${Math.random() * 2 + 1}px`,
        opacity: `${Math.random() * 0.4 + 0.3}`,
      }));
      setDots(newDots);
    };
    generateDots();
  }, []);

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
        `}
      </style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {dots.map(dot => (
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

// Componente para o fundo animado
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c740,transparent)]"></div>
  </div>
);

// Componente para o item do FAQ (Accordion)
const FaqItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div
      layout
      className="bg-white/70 p-4 rounded-lg border border-zinc-200 hover:border-amber-400/50 transition-colors duration-300 cursor-pointer shadow-sm"
      onClick={onClick}
    >
      <motion.div layout className="w-full text-left flex justify-between items-center">
        <span className="text-lg font-medium text-zinc-800">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Feather.ChevronRight size={24} className="text-amber-500" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`answer-${question}`}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-zinc-600 whitespace-pre-line">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

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
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.fbq) {
      !(function(f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', 'SEU_PIXEL_ID');
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
        <Helmet>
          <title>ZailonSoft - Venda Carros 24h por Dia no Piloto Automático</title>
          <meta name="description" content="O sistema que qualifica clientes, captura dados e organiza sua loja de carros. Aumente suas vendas e libere seus vendedores para fechar negócios." />
          <meta property="og:title" content="ZailonSoft - Venda Carros 24h por Dia no Piloto Automático" />
          <meta property="og:description" content="O sistema que qualifica clientes, captura dados e organiza sua loja de carros. Aumente suas vendas e libere seus vendedores para fechar negócios." />
          <link rel="icon" type="image/png" href="/assets/favicon/favicon-32x32.png" sizes="32x32" />
        </Helmet>
        
        <LightDotsBackground />
        <AnimatedBackground />

        <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-lg border-b border-zinc-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold tracking-wider text-zinc-900">
              Zailon<span className="text-amber-500">Soft</span>
            </Link>
            <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-white/95 md:bg-transparent items-center gap-4 md:gap-6 p-4 md:p-0`}>
              <a href="#solucao" onClick={closeMenu} className="text-zinc-700 hover:text-amber-500 transition-colors">A Solução</a>
              <a href="#planos" onClick={closeMenu} className="text-zinc-700 hover:text-amber-500 transition-colors">Preços</a>
              <a href="#faq" onClick={closeMenu} className="text-zinc-700 hover:text-amber-500 transition-colors">Dúvidas</a>
              <div className="h-6 w-px bg-zinc-300 hidden md:block"></div>
              {user ? (
                <motion.button
                  onClick={handleLogout}
                  className="text-amber-500 hover:text-amber-600 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Feather.LogOut size={18} /> Sair
                </motion.button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="text-amber-500 hover:text-amber-600 transition-all flex items-center gap-2">
                    <Feather.LogIn size={18} /> Login
                  </Link>
                  <Link to="/signup" onClick={closeMenu} className="bg-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                    Criar Conta <Feather.UserPlus size={18} />
                  </Link>
                </>
              )}
            </nav>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-amber-500 focus:outline-none" aria-label="Toggle Menu">
              {isMenuOpen ? <Feather.X size={30} /> : <Feather.Menu size={30} />}
            </button>
          </div>
        </header>

        <main>
          <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-zinc-900 leading-tight">
                  Sua loja de carros vendendo <br/> <span className="text-amber-500">24 horas por dia.</span> No piloto automático.
                </h1>
                <p className="text-zinc-600 max-w-3xl mx-auto text-xl mb-10">
                  Nosso bot qualifica cada cliente no WhatsApp, coleta todos os dados para a venda (troca, financiamento, à vista) e entrega o negócio pronto para seus vendedores apenas assinarem o contrato.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={user ? "/sistema" : "/signup"}
                      className="w-full sm:w-auto inline-block bg-amber-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                    >
                      {user ? "Acessar Sistema" : "Começar Agora"} <Feather.ArrowRight size={22} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto inline-block bg-transparent border-2 border-amber-500 text-amber-500 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-amber-50 hover:border-amber-600"
                    >
                      <Feather.LogIn size={22} /> Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="#download-bot"
                      className="w-full sm:w-auto inline-block bg-transparent border-2 border-zinc-300 text-zinc-700 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-zinc-100 hover:border-zinc-400"
                    >
                      <Feather.DownloadCloud size={22} /> Baixar o Bot
                    </a>
                  </motion.div>
                </div>
                <p className="text-zinc-500 mt-4 text-sm">Download grátis. Ativação requer assinatura.</p>
              </motion.div>
            </div>
          </section>

          <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50">
            <div className="max-w-7xl mx-auto text-center">
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">A FERRAMENTA DEFINITIVA</motion.p>
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">Sua loja inteira, na palma da sua mão.</motion.h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <img 
                    src={DashboardImage} 
                    alt="Dashboard da ZailonSoft em um notebook e celular" 
                    className="rounded-xl shadow-xl shadow-zinc-200 border border-zinc-200 w-full"
                    onError={(e) => {
                      console.error('Erro ao carregar a imagem do dashboard:', e);
                      e.currentTarget.src = '/assets/placeholder.png'; // Fallback para uma imagem alternativa
                    }}
                  />
                </motion.div>
                <motion.div className="text-left space-y-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.Cpu className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Bot Local, Gestão na Nuvem</h3>
                      <p className="text-zinc-600">Nosso bot roda diretamente no seu computador, garantindo velocidade máxima. Mas toda a gestão de veículos, clientes e relatórios é 100% online, acessível de qualquer lugar, a qualquer hora.</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.Users className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Qualificação Profunda de Leads</h3>
                      <p className="text-zinc-600">O bot não é um simples robô. Ele simula um vendedor, extraindo informações cruciais: se o cliente tem carro para troca, qual o modelo, se precisa de financiamento e o valor da entrada. O lead chega 100% qualificado.</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.BarChart2 className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Dashboard e Relatórios Inteligentes</h3>
                      <p className="text-zinc-600">Acesse um painel completo com o status de cada atendimento, o funil de vendas em tempo real e relatórios detalhados para tomar as melhores decisões e gerenciar sua equipe de vendedores.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-100">
            <div className="max-w-4xl mx-auto text-center">
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">INVESTIMENTO INTELIGENTE</motion.p>
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">Um plano simples. Resultados completos.</motion.h2>
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white p-8 rounded-xl border border-amber-300 shadow-xl shadow-amber-100">
                <h3 className="text-2xl font-semibold text-zinc-900 mb-2">ZailonSoft Pro</h3>
                <p className="text-zinc-600 mb-6">Tudo que você precisa para automatizar e escalar suas vendas.</p>
                <p className="text-5xl font-bold text-zinc-900 mb-4">R$ 350<span className="text-xl text-zinc-500">/mês</span></p>
                <ul className="text-left space-y-3 my-8 max-w-sm mx-auto text-zinc-800">
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Bot de Atendimento Ilimitado</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Qualificação Automática de Leads</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Gestão de Veículos e Clientes</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Acesso Web e Mobile ao Dashboard</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Relatórios de Desempenho</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Suporte Prioritário</li>
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
                  <Link
                    to="/signup"
                    className="inline-block bg-amber-500 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                  >
                    Assinar e Vender Mais
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-zinc-900">Dúvidas Comuns</motion.h2>
              </div>
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {[
                  { question: 'Como o bot funciona na prática?', answer: 'Você faz o download e instala o bot em um computador da sua loja. Ele fica rodando 24/7. Toda a configuração e o acompanhamento dos leads capturados são feitos pela plataforma online, que você pode acessar pelo celular ou qualquer outro computador.' },
                  { question: 'Preciso ter conhecimento técnico?', answer: 'Não! A instalação é simples e nossa equipe de suporte te auxilia em todo o processo. A plataforma de gestão é super intuitiva, pensada para donos de loja e vendedores, não para programadores.' },
                  { question: 'O que acontece depois que o bot qualifica o lead?', answer: 'O lead qualificado, com todos os dados (nome, telefone, interesse, carro de troca, documentos, se é ou não financiamento e os dados relacioandos etc...), aparece instantaneamente no relatorio do cliente presente no CRM. Seus vendedores acessam todos os dados do cliente e podem entrar em contato com o cliente já sabendo de tudo e ou até com a simulação de financiamento pronta tudo pronto apenas fechat negocio a venda.' },
                  { question: 'Existe algum contrato de fidelidade?', answer: 'Não. Nosso plano é mensal e você pode cancelar quando quiser, sem multas. Confiamos tanto no resultado que o ZailonSoft vai gerar que não precisamos de contratos para te prender.' },
                ].map((item, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <FaqItem
                      question={item.question}
                      answer={item.answer}
                      isOpen={openFaq === index}
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </main>
        
        <footer className="bg-zinc-100 py-8 px-4 sm:px-6 lg:px-8 text-center border-t border-zinc-200">
          <p className="text-zinc-600 text-sm">© 2025 ZailonSoft. Todos os direitos reservados.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default HomePage;