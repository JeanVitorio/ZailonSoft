import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import * as Feather from 'react-feather';
import { useAuth } from '@/auth/AuthContext';

// --- [CORRIGIDO] Definição completa dos componentes auxiliares ---

// Componente para pontos de luz animados
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

// Componente para o item do FAQ (Accordion)
const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
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
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
    };

    return (
        <HelmetProvider>
            <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
                <Helmet>
                    <title>ZailonSoft - Transforme Cliques em Vendas de Veículos</title>
                    <meta name="description" content="Otimize a captação de leads e propostas de financiamento com formulários inteligentes. Entregue negociações prontas para seus vendedores e acelere suas vendas." />
                    <meta property="og:title" content="ZailonSoft - Formulários Inteligentes para Concessionárias" />
                    <meta property="og:description" content="Capte propostas de financiamento completas, com dados de troca e informações do cliente, e gerencie tudo em um CRM visual." />
                    <link rel="icon" type="image/png" href="/assets/favicon/favicon-32x32.png" sizes="32x32" />
                    <link rel="preload" href="/BannerCamaro.png" as="image" media="(min-width: 1024px)" />
                    <link rel="preload" href="/CamaroBranco.png" as="image" media="(max-width: 1023px)" />
                </Helmet>
                
                <LightDotsBackground />
                
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
                            
                            {loading ? (
                                <Feather.Loader size={18} className="animate-spin text-zinc-500" />
                            ) : user ? (
                                <motion.button onClick={handleLogout} className="text-amber-500 hover:text-amber-600 transition-all flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                    <section id="inicio" className="relative w-full min-h-screen flex items-center pt-20 bg-zinc-900">
                        <div className="absolute inset-0 hidden lg:block bg-cover bg-center z-0 bg-no-repeat" style={{ backgroundImage: `url(/BannerCamaro.png)` }}></div>
                        <div className="absolute inset-0 block lg:hidden bg-cover bg-center z-0 bg-no-repeat" style={{ backgroundImage: `url(/CamaroBranco.png)` }}></div>
                        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
                            <div className="grid lg:grid-cols-5 gap-12 items-center">
                                <motion.div 
                                    className="text-center lg:text-left lg:col-span-5 text-white"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                                        Converta Visitantes em <span className="text-amber-400">Propostas Reais.</span>
                                    </motion.h1>
                                    <motion.p variants={fadeInUp} className="max-w-xl mx-auto lg:mx-0 text-xl mb-10 text-zinc-200">
                                        Pare de coletar apenas contatos. Receba propostas de financiamento completas com nosso formulário inteligente e envie para o banco em minutos.
                                    </motion.p>
                                    
                                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Link
                                                to={loading || !user ? "/signup" : "/sistema"}
                                                className={`w-full sm:w-auto inline-block bg-amber-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={(e) => { if (loading) e.preventDefault(); }}
                                            >
                                                {loading 
                                                    ? <><Feather.Loader size={22} className="animate-spin" /> Verificando...</> 
                                                    : user 
                                                        ? <>Acessar Sistema <Feather.ArrowRight size={22} /></>
                                                        : <>Começar Agora <Feather.ArrowRight size={22} /></>
                                                }
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    <div className='relative'>
                        <AnimatedBackground />
                        <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50/80">
                            <div className="max-w-7xl mx-auto text-center">
                                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">A SOLUÇÃO INTELIGENTE</motion.p>
                                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">O Fim da Perda de Tempo com Leads Frios</motion.h2>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                        <img src="/Formulario.png" alt="Tela do formulário de propostas da ZailonSoft" className="rounded-xl shadow-xl shadow-zinc-200 border border-zinc-200 w-full" loading="lazy" />
                                    </motion.div>
                                    <motion.div className="text-left space-y-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                        <motion.div variants={fadeInUp} className="flex items-start gap-4">
                                            <Feather.FileText className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                                            <div>
                                                <h3 className="text-xl font-semibold text-zinc-900">Formulários de Proposta Completos</h3>
                                                <p className="text-zinc-600">Nosso formulário dinâmico guia o cliente passo a passo, coletando todos os dados necessários para a ficha de financiamento: informações pessoais, detalhes do veículo de interesse, dados do carro na troca e proposta de pagamento.</p>
                                            </div>
                                        </motion.div>
                                        <motion.div variants={fadeInUp} className="flex items-start gap-4">
                                            <Feather.Filter className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                                            <div>
                                                <h3 className="text-xl font-semibold text-zinc-900">Qualificação Automática</h3>
                                                <p className="text-zinc-600">Chega de perder tempo com curiosos. O sistema organiza e apresenta apenas os leads que preencheram uma proposta completa, entregando oportunidades reais de negócio para sua equipe de vendas.</p>
                                            </div>
                                        </motion.div>
                                        <motion.div variants={fadeInUp} className="flex items-start gap-4">
                                            <Feather.Layout className="text-amber-500 mt-1 flex-shrink-0" size={24}/>
                                            <div>
                                                <h3 className="text-xl font-semibold text-zinc-900">CRM e Dashboard: Seu Centro de Comando</h3>
                                                <p className="text-zinc-600">Visualize todas as propostas em um funil Kanban intuitivo e acompanhe as métricas de vendas em tempo real. Tenha o controle total do seu processo comercial, na palma da sua mão.</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </section>
                        
                        <section id="crm" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80">
                            <div className="max-w-7xl mx-auto">
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <motion.div className="text-left space-y-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                        <motion.p variants={fadeInUp} className="text-amber-500 font-medium">DE PROPOSTA A VENDA</motion.p>
                                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-zinc-900">Transforme Fichas em Carros Entregues</motion.h2>
                                        <motion.p variants={fadeInUp} className="text-zinc-600 text-lg">
                                            Diga adeus a planilhas e papéis. Com a proposta do cliente já qualificada e todos os dados organizados no CRM, seu vendedor foca no que realmente importa: negociar, aprovar o crédito e fechar a venda. Aumente a agilidade e a taxa de conversão da sua equipe.
                                        </motion.p>
                                    </motion.div>
                                    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                        <img src="/CRM.png" alt="Tela do CRM da ZailonSoft com funil de vendas Kanban" className="rounded-xl shadow-2xl shadow-zinc-300 border border-zinc-200 w-full" loading="lazy" />
                                    </motion.div>
                                </div>
                            </div>
                        </section>

                        <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-100/80">
                            <div className="max-w-4xl mx-auto text-center">
                                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-amber-500 font-medium mb-2">INVESTIMENTO INTELIGENTE</motion.p>
                                <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-zinc-900">Um plano simples. Resultados completos.</motion.h2>
                                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white p-8 rounded-xl border border-amber-300 shadow-xl shadow-amber-100">
                                    <h3 className="text-2xl font-semibold text-zinc-900 mb-2">ZailonSoft Pro</h3>
                                    <p className="text-zinc-600 mb-6">Tudo que você precisa para otimizar e escalar suas vendas.</p>
                                    <p className="text-5xl font-bold text-zinc-900 mb-4">R$ 299<span className="text-xl text-zinc-500">/mês</span></p>
                                    <ul className="text-left space-y-3 my-8 max-w-sm mx-auto text-zinc-800">
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Formulários de Proposta Inteligentes</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Leads 100% Qualificados com dados</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Catálogo de Veículos Integrado</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> CRM Visual para Gestão de Vendas</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Dashboard e Relatórios de Desempenho</li>
                                        <li className="flex items-center gap-3"><Feather.CheckCircle size={20} className="text-amber-500" /> Suporte Prioritário</li>
                                    </ul>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
                                        <Link to="/signup" className="inline-block bg-amber-500 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]">
                                            Assinar e Acelerar Minhas Vendas
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </section>

                        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80">
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
                
                <footer className="bg-zinc-100 py-8 px-4 sm:px-6 lg:px-8 text-center border-t border-zinc-200">
                    <p className="text-zinc-600 text-sm">© 2025 ZailonSoft. Todos os direitos reservados.</p>
                </footer>
            </div>
        </HelmetProvider>
    );
};

export default HomePage;