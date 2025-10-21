import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';

// --- IMPORTAÇÃO DOS VÍDEOS ---
// (Assumindo que eles estão na MESMA pasta que este arquivo HomePage.tsx)
import formularioVideo from './Formulario.mp4';
import relatorioVideo from './Relatorio.mp4';
import crmVideo from './CRMKanban.mp4';
import dashboardVideo from './dash.mp4'; // <- VÍDEO DO DASHBOARD ADICIONADO


// Componente para pontos de luz animados (fundo dinâmico)
const LightDotsBackground = () => {
    const [dots, setDots] = useState<any[]>([]);

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

// Componente para o fundo animado das outras seções
const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c740,transparent)]"></div>
    </div>
);

// Componente para o item do FAQ (Accordion) - Estilos atualizados para tema escuro
const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
    return (
        <motion.div
            layout
            className="faq-item bg-zinc-700/50 p-4 rounded-lg border border-zinc-600 hover:border-amber-400/50 transition-colors duration-300 cursor-pointer shadow-sm backdrop-blur-sm"
            onClick={onClick}
        >
            <motion.div layout className="w-full text-left flex justify-between items-center">
                <span className="text-lg font-medium text-white">{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Feather.Plus size={24} className="text-amber-500" />
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
                        <p className="text-zinc-300 whitespace-pre-line">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


const HomePage = () => {
    const { user, loading, logout } = useAuth();
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
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    useEffect(() => {
        const header = document.querySelector('header');
        if (!header) return; // Adicionado verificação para garantir que o header exista
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <HelmetProvider>
            <div className="min-h-screen bg-zinc-900 text-zinc-200 font-montserrat relative overflow-x-hidden">
                <Helmet>
                    <title>ZailonSoft - Transforme Cliques em Vendas de Veículos</title>
                    <meta name="description" content="Otimize a captação de leads e propostas de financiamento com formulários inteligentes. Entregue negociações prontas para seus vendedores e acelere suas vendas." />
                    <meta property="og:title" content="ZailonSoft - Formulários Inteligentes para Concessionárias" />
                    <meta property="og:description" content="Capte propostas de financiamento completas, com dados de troca e informações do cliente, e gerencie tudo em um CRM visual." />
                    <link rel="icon" type="image/x-icon" href="/Favicon.ico" /> 
                    
                    {/* --- OTIMIZAÇÃO DE CARREGAMENTO DA IMAGEM --- */}
                    {/* Adiciona fetchpriority="high" para priorizar a imagem de desktop */}
                    <link rel="preload" href="/BannerCamaro.png" as="image" media="(min-width: 1024px)" fetchpriority="high" />
                    {/* Mantém o preload da imagem de mobile */}
                    <link rel="preload" href="/CamaroBranco.png" as="image" media="(max-width: 1023px)" />
                    
                    {/* Estilos para carregar o background condicionalmente via Media Query */}
                    <style>
                    {`
                      .hero-section {
                        /* Mobile-first: Carrega a imagem mais leve por padrão */
                        /* Lembre-se de trocar para .webp se você otimizar a imagem! */
                        background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/CamaroBranco.png);
                      }

                      @media (min-width: 1024px) {
                        /* Desktop: Troca pela imagem maior */
                        /* Lembre-se de trocar para .webp se você otimizar a imagem! */
                        .hero-section {
                          background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/BannerCamaro.png);
                        }
                      }
                    `}
                    </style>
                    {/* --- FIM DA OTIMIZAÇÃO --- */}

                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap" rel="stylesheet" />
                </Helmet>

                <LightDotsBackground />

                <header className="fixed top-0 left-0 w-full bg-transparent transition-all duration-400 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                        <Link to="/" className="text-2xl font-bold tracking-wider text-amber-400">
                            Zailon<span className="text-white">Soft</span>
                        </Link>

                        <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-zinc-900/95 md:bg-transparent items-center gap-4 md:gap-6 p-4 md:p-0`}>
                            <a href="#solucao" onClick={closeMenu} className="text-zinc-300 hover:text-amber-400 transition-colors">A Solução</a>
                            <a href="#crm" onClick={closeMenu} className="text-zinc-300 hover:text-amber-400 transition-colors">Como Funciona</a>
                            <a href="#planos" onClick={closeMenu} className="text-zinc-300 hover:text-amber-400 transition-colors">Preços</a>
                            <a href="#faq" onClick={closeMenu} className="text-zinc-300 hover:text-amber-400 transition-colors">Dúvidas</a>
                            <div className="h-6 w-px bg-zinc-600 hidden md:block"></div>
                            {loading ? (
                                <Feather.Loader size={18} className="animate-spin text-zinc-500" />
                            ) : user ? (
                                <motion.button onClick={handleLogout} className="text-amber-400 hover:text-amber-500 transition-all flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Feather.LogOut size={18} /> Sair
                                </motion.button>
                            ) : (
                                <>
                                    <Link to="/login" onClick={closeMenu} className="text-amber-400 hover:text-amber-500 transition-all flex items-center gap-2">
                                        <Feather.LogIn size={18} /> Login
                                    </Link>
                                    <Link to="/signup" onClick={closeMenu} className="bg-amber-400 text-zinc-900 px-5 py-2 rounded-full font-semibold hover:bg-amber-500 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                                        Criar Conta <Feather.UserPlus size={18} />
                                    </Link>
                                </>
                            )}
                        </nav>
                        
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-amber-400 focus:outline-none" aria-label="Toggle Menu">
                            {isMenuOpen ? <Feather.X size={30} /> : <Feather.Menu size={30} />}
                        </button>
                    </div>
                </header>

                <main>
                    {/* A tag 'style' inline foi removida. O CSS do <Helmet> agora controla o background */}
                    <section id="inicio" className="hero-section relative w-full min-h-screen flex items-center justify-center pt-20 bg-cover bg-center">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
                            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
                                    Converta Visitantes em <span className="text-amber-400">Propostas Reais.</span>
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-xl mb-10 text-zinc-300">
                                    Pare de coletar apenas contatos. Receba propostas de financiamento completas com nosso formulário inteligente e envie para o banco em minutos.
                                </motion.p>
                                <motion.div variants={fadeInUp}>
                                    <Link
                                        to={loading || !user ? "/signup" : "/sistema"}
                                        className="inline-block bg-amber-400 text-zinc-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                                    >
                                        {loading ? <span className="flex items-center justify-center gap-2"><Feather.Loader size={22} className="animate-spin" /> Verificando...</span> : user ? <span className="flex items-center justify-center gap-2">Acessar Sistema <Feather.ArrowRight size={22} /></span> : <span className="flex items-center justify-center gap-2">Comece Agora <Feather.ArrowRight size={22} /></span>}
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </section>

                    <div className='relative'>
                        <AnimatedBackground />

                        <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-800/80">
                            <div className="max-w-7xl mx-auto text-center">
                                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-white">A Solução Inteligente em Ação</motion.h2>
                                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.2 }} className="text-xl text-amber-400 mt-2 mb-20">Veja como cada ferramenta foi desenhada para maximizar suas vendas.</motion.p>
                                
                                {/* Feature 1: Formulário (com vídeo) */}
                                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center mb-20 text-left">
                                    <motion.div variants={fadeInUp}>
                                        <video 
                                            src={formularioVideo} 
                                            alt="Vídeo do Formulário de proposta ZailonSoft" 
                                            className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                                            controls={false}
                                            loop 
                                            muted 
                                            autoPlay 
                                            playsInline
                                            preload="auto"
                                        />
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-amber-400/10 p-3 rounded-full"><Feather.FileText className="text-amber-400" size={24} /></div>
                                            <h3 className="text-2xl font-bold text-white">Formulários que Convertem</h3>
                                        </div>
                                        <p className="text-zinc-300 text-lg leading-relaxed">
                                            Nosso formulário dinâmico guia o cliente passo a passo, coletando de forma intuitiva todos os dados para a ficha de financiamento: informações pessoais, veículo de interesse, dados do carro na troca e proposta de pagamento.
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {/* Feature 2: Dashboard (CORRIGIDO PARA VÍDEO) */}
                                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center mb-20 text-left">
                                    <motion.div variants={fadeInUp} className="md:order-last">
                                        <video 
                                            src={dashboardVideo} 
                                            alt="Vídeo do Dashboard de gestão ZailonSoft" 
                                            className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                                            controls={false} 
                                            loop 
                                            muted 
                                            autoPlay 
                                            playsInline
                                            preload="auto"
                                        />
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-amber-400/10 p-3 rounded-full"><Feather.BarChart2 className="text-amber-400" size={24} /></div>
                                            <h3 className="text-2xl font-bold text-white">Dashboard com Inteligência</h3>
                                        </div>
                                        <p className="text-zinc-300 text-lg leading-relaxed">
                                            Tenha uma visão 360º do seu negócio. Acompanhe em tempo real o número de propostas recebidas, a taxa de conversão e o desempenho da sua equipe. Dados visuais para decisões mais rápidas e estratégicas.
                                        </p>
                                    </motion.div>
                                </motion.div>
                                
                                {/* Feature 3: Relatório do Cliente (com vídeo) */}
                                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center text-left">
                                    <motion.div variants={fadeInUp}>
                                        <video 
                                            src={relatorioVideo} 
                                            alt="Vídeo do Relatório detalhado do cliente ZailonSoft" 
                                            className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                                            controls={false} 
                                            loop 
                                            muted 
                                            autoPlay 
                                            playsInline
                                            preload="auto"
                                        />
                                    </motion.div>
                                    <motion.div variants={fadeInUp}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-amber-400/10 p-3 rounded-full"><Feather.UserCheck className="text-amber-400" size={24} /></div>
                                            <h3 className="text-2xl font-bold text-white">Propostas Prontas para Análise</h3>
                                        </div>
                                        <p className="text-zinc-300 text-lg leading-relaxed">
                                            Chega de perder tempo com curiosos ou preencher fichas à mão. Cada lead qualificado gera um relatório completo e organizado, com todos os dados do cliente e da proposta, pronto para ser enviado ao banco.
                                        </p>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </section>
                        
                        {/* Seção CRM (com vídeo) */}
                        <section id="crm" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/80">
                            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">DE PROPOSTA A VENDA</h2>
                                    <p className="text-xl text-amber-400 mt-2 mb-6">Transforme Fichas em Carros Entregues</p>
                                    <p className="text-zinc-300 text-lg leading-relaxed">
                                        Diga adeus a planilhas e papéis. Com a proposta do cliente já qualificada e todos os dados organizados no CRM, seu vendedor foca no que realmente importa: negociar, aprovar o crédito e fechar a venda. Aumente a agilidade e a taxa de conversão da sua equipe.
                                    </p>
                                </motion.div>
                                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.2 }}>
                                    <video 
                                        src={crmVideo} 
                                        alt="Vídeo do CRM Visual com funil Kanban da ZailonSoft" 
                                        className="rounded-xl shadow-2xl shadow-black/50 w-full ring-1 ring-white/10"
                                        controls={false} 
                                        loop 
                                        muted 
                                        autoPlay 
                                        playsInline
                                        preload="auto"
                                    />
                                </motion.div>
                            </div>
                        </section>

                        <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-800/80">
                            <div className="max-w-4xl mx-auto text-center">
                                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-white">INVESTIMENTO INTELIGENTE</motion.h2>
                                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.2 }} className="text-xl text-zinc-300 mt-2 mb-12">Um plano simples. Resultados completos.</motion.p>
                                
                                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-zinc-700/50 p-8 rounded-xl shadow-xl shadow-amber-400/10 backdrop-blur-sm">
                                    <h3 className="text-2xl font-semibold text-white mb-2">ZailonSoft Pro</h3>
                                    <p className="text-zinc-400 mb-6">Tudo que você precisa para otimizar e escalar suas vendas.</p>
                                    <p className="text-5xl font-bold text-white mb-4">R$ 299<span className="text-xl text-zinc-400">/mês</span></p>
                                    <ul className="text-left space-y-3 my-8 max-w-sm mx-auto text-zinc-300">
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> Formulários de Proposta Inteligentes</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> Leads 100% Qualificados com dados</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> Catálogo de Veículos Integrado</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> CRM Visual para Gestão de Vendas</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> Dashboard e Relatórios de Desempenho</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-400" /> Suporte Prioritário</li>
                                    </ul>
                                    <Link to="/signup" className="inline-block bg-amber-400 text-zinc-900 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]">
                                        Assinar e Acelerar Minhas Vendas
                                    </Link>
                                </motion.div>
                            </div>
                        </section>

                        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/80">
                            <div className="max-w-3xl mx-auto">
                                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">Perguntas Frequentes</motion.h2>
                                <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                                    {[
                                        { question: 'Como o formulário sabe quais carros oferecer?', answer: 'Ele pode ser conectado ao seu Catálogo de Veículos. Você pode gerar um link de proposta para um carro específico, e o formulário já abre pré-preenchido com aquele veículo, otimizando a jornada do cliente.' },
                                        { question: 'Preciso ter conhecimento técnico?', answer: 'Não! A plataforma é super intuitiva, pensada para donos de loja e vendedores. Nós cuidamos de toda a parte técnica para você focar em vender.' },
                                        { question: 'O que acontece depois que o cliente preenche o formulário?', answer: 'A proposta completa, com todos os dados, aparece instantaneamente no seu CRM como um novo card no funil de vendas. Seu vendedor é notificado e já pode dar andamento na análise de crédito e negociação.' },
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
                    </div>
                </main>

                <footer className="bg-zinc-800 py-8 px-4 sm:px-6 lg:px-8 text-center border-t border-zinc-600">
                    <p className="text-zinc-400 text-sm">© 2025 ZailonSoft. Todos os direitos reservados.</p>
                </footer>
            </div>
        </HelmetProvider>
    );
};

export default HomePage;