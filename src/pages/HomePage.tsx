import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';
import CrmImage from './CRM.png'; // Imagem do CRM
import CatalogoImage from './Catalogo.png'; // Imagem do Catálogo
import HeroImage from './HomemComemorando.png'; // Nova imagem do vendedor

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
    if (typeof window !== 'undefined' && !(window as any).fbq) {
      (function(f, b, e, v, n, t, s) {
        if ((f as any).fbq) return;
        n = (f as any).fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!(f as any)._fbq) (f as any)._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      (window as any).fbq('init', 'SEU_PIXEL_ID');
      (window as any).fbq('track', 'PageView');
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
        <Helmet>
          <title>ZailonSoft - Sua Concessionária Faturando 24h por Dia</title>
          <meta name="description" content="Chega de perder vendas. Nosso assistente virtual qualifica clientes no WhatsApp e entrega o negócio pronto no seu CRM. Aumente seu faturamento agora." />
          <meta property="og:title" content="ZailonSoft - Sua Concessionária Faturando 24h por Dia" />
          <meta property="og:description" content="Chega de perder vendas. Nosso assistente virtual qualifica clientes no WhatsApp e entrega o negócio pronto no seu CRM." />
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
              <a href="#crm" onClick={closeMenu} className="text-zinc-700 hover:text-amber-500 transition-colors">Como Funciona</a>
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
          <section id="inicio" className="relative w-full min-h-screen flex items-center pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  className="text-center lg:text-left"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold mb-6 text-zinc-900 leading-tight">
                    Sua Concessionária <span className="text-amber-500">Faturando 24h por Dia.</span>
                  </motion.h1>
                  <motion.p variants={fadeInUp} className="text-zinc-600 max-w-xl mx-auto lg:mx-0 text-xl mb-10">
                    Chega de perder vendas. Nosso assistente virtual qualifica clientes no WhatsApp e entrega o negócio pronto no seu CRM. <strong>Seus vendedores só precisam fechar.</strong>
                  </motion.p>
                  <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={user ? "/sistema" : "/signup"}
                        className="w-full sm:w-auto inline-block bg-amber-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                      >
                        {user ? "Acessar Sistema" : "Quero Vender Mais Agora"} <Feather.ArrowRight size={22} />
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
                  </motion.div>
                  <motion.p variants={fadeInUp} className="text-zinc-500 mt-4 text-sm">Download grátis. Ativação requer assinatura.</motion.p>
                </motion.div>
                <motion.div 
                  className="hidden lg:block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <img src={HeroImage} alt="Vendedor feliz comemorando uma venda com celular na mão" className="w-full h-auto" />
                </motion.div>
              </div>
            </div>
          </section>

          <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50">
            <div className="max-w-7xl mx-auto text-center">
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">A FERRAMENTA DEFINITIVA</motion.p>
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">A Máquina de Vendas que Trabalha por Você</motion.h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <img 
                    src={CatalogoImage} 
                    alt="Tela do catálogo de veículos da ZailonSoft mostrando diversos carros" 
                    className="rounded-xl shadow-xl shadow-zinc-200 border border-zinc-200 w-full"
                  />
                </motion.div>
                <motion.div className="text-left space-y-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.BookOpen className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Catálogo Inteligente Conectado</h3>
                      <p className="text-zinc-600">Cadastre seu estoque uma única vez. Nosso bot acessa seu catálogo em tempo real para apresentar as melhores opções aos clientes, com fotos e detalhes, **poupando horas de trabalho manual** da sua equipe.</p>
                    </div>
                  </motion.div>
                   <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.Users className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">Leads 100% Qualificados</h3>
                      <p className="text-zinc-600">O bot simula um vendedor, extraindo informações cruciais: se o cliente tem carro para troca, se precisa de financiamento e valor de entrada. **Chega de perder tempo** com curiosos.</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <Feather.Layout className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900">CRM e Dashboard: Seu Centro de Comando</h3>
                      <p className="text-zinc-600">Visualize todas as negociações em tempo real no funil Kanban. Com o Dashboard, você tem relatórios claros sobre o desempenho da sua equipe e a saúde do seu negócio. **Tenha o controle total, na palma da sua mão.**</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
          
          <section id="crm" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                  <motion.div 
                      className="text-left space-y-4"
                      variants={staggerContainer} 
                      initial="hidden" 
                      whileInView="visible" 
                      viewport={{ once: true }}
                  >
                      <motion.p variants={fadeInUp} className="text-amber-500 font-medium">DE LEAD A CLIENTE</motion.p>
                      <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-zinc-900">Transforme Conversas em Contratos Assinados</motion.h2>
                      <motion.p variants={fadeInUp} className="text-zinc-600 text-lg">
                          Diga adeus a planilhas confusas e anotações perdidas. Com o lead perfeitamente qualificado e todos os dados organizados no CRM, seu vendedor foca no que realmente importa: **o relacionamento e o fechamento.** Aumente a taxa de conversão da sua equipe e veja seu faturamento crescer.
                      </motion.p>
                  </motion.div>
                  <motion.div 
                      variants={fadeInUp} 
                      initial="hidden" 
                      whileInView="visible" 
                      viewport={{ once: true }}
                  >
                      <img 
                          src={CrmImage} 
                          alt="Tela do CRM da ZailonSoft com um funil de vendas Kanban" 
                          className="rounded-xl shadow-2xl shadow-zinc-300 border border-zinc-200 w-full"
                      />
                  </motion.div>
              </div>
            </div>
          </section>

          <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-100">
            <div className="max-w-4xl mx-auto text-center">
              <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">PREÇO SIMPLES. LUCRO IMEDIATO.</motion.p>
              <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">Um plano simples. Resultados completos.</motion.h2>
              <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white p-8 rounded-xl border border-amber-300 shadow-xl shadow-amber-100">
                <h3 className="text-2xl font-semibold text-zinc-900 mb-2">ZailonSoft Pro</h3>
                <p className="text-zinc-600 mb-6">Tudo que você precisa para automatizar e escalar suas vendas.</p>
                <p className="text-5xl font-bold text-zinc-900 mb-4">R$ 299<span className="text-xl text-zinc-500">/mês</span></p>
                <ul className="text-left space-y-3 my-8 max-w-sm mx-auto text-zinc-800">
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> **Atendimento 24/7** que não perde clientes</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Leads **100% Qualificados** e prontos</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> **Catálogo Inteligente** conectado ao Bot</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> **CRM Visual** para controle total das vendas</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Dashboard e Relatórios de Desempenho</li>
                  <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Suporte Prioritário</li>
                </ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
                  <Link
                    to="/signup"
                    className="inline-block bg-amber-500 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                  >
                    Assinar e Aumentar Meu Lucro
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>

          <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-zinc-900">Perguntas Frequentes</motion.h2>
              </div>
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {[
                  { question: 'Como o bot sabe quais carros oferecer?', answer: 'Ele se conecta diretamente ao seu Catálogo de Veículos cadastrado no sistema. Quando um cliente descreve o que procura, o bot busca as melhores correspondências no seu estoque e as apresenta automaticamente. Você atualiza o catálogo no sistema, e o bot já sabe o que vender.' },
                  { question: 'Preciso ter conhecimento técnico?', answer: 'Não! A instalação é simples e nossa equipe de suporte te auxilia em todo o processo. A plataforma de gestão é super intuitiva, pensada para donos de loja e vendedores, não para programadores.' },
                  { question: 'O que acontece depois que o bot qualifica o lead?', answer: 'O lead qualificado, com todos os dados, aparece instantaneamente no seu CRM como um novo card no funil de vendas. Seu vendedor recebe a notificação e já pode preparar a proposta final. Menos tempo digitando, mais tempo vendendo.' },
                  { question: 'Existe algum contrato de fidelidade?', answer: 'Não. Nosso plano é mensal e você pode cancelar quando quiser. Nossa confiança no produto é total, acreditamos que os resultados falarão por si e você se tornará um parceiro por escolha, não por obrigação.' },
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