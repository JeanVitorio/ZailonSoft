import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Users, BarChart3, Package, Headphones, Shield, MessageCircle, ChevronDown, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCarImage from '@/assets/hero-car.jpg';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const features = [
    { icon: Package, title: 'Catálogo Premium', description: 'Feed estilo Instagram com fotos e vídeos de alta qualidade' },
    { icon: Users, title: 'Gestão de Leads', description: 'CRM Kanban para acompanhar cada oportunidade de venda' },
    { icon: BarChart3, title: 'Relatórios Completos', description: 'Dashboard com métricas de conversão e performance' },
    { icon: Zap, title: 'Integração WhatsApp', description: 'Contato direto com clientes interessados' },
    { icon: Shield, title: 'Multi-usuários', description: 'Equipe de vendedores com controle de acesso' },
    { icon: Headphones, title: 'Suporte Premium', description: 'Atendimento dedicado para sua loja' },
  ];

  const benefits = [
    'Sistema entregue pronto e configurado',
    'Sem mensalidades ou taxas ocultas',
    'Treinamento completo incluído',
    'Atualizações gratuitas',
    'Suporte vitalício via WhatsApp',
    'Personalização com sua marca',
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-lg font-bold text-white">AutoConnect</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/demo">
                <Button variant="ghost" size="sm">Catálogo</Button>
              </Link>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="sm">
                  <MessageCircle className="w-4 h-4" />
                  Contato
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero with Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div
          style={{ y: heroImageY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroCarImage}
            alt="Luxury car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/50 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/60" />
        </motion.div>

        {/* Amber glow overlay */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[300px] md:h-[500px] bg-amber-500/8 rounded-full blur-[150px] z-0" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Plataforma E-commerce para Lojas de Veículos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              Potencialize sua
              <span className="text-gradient block">Loja de Veículos</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
              Sistema completo entregue pronto para uso. Catálogo premium, gestão de leads e relatórios avançados.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer">
                <Button variant="premium" size="xl">
                  <MessageCircle className="w-5 h-5" />
                  Solicitar Demonstração
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Link to="/demo">
                <Button variant="glass" size="xl">
                  Ver Catálogo Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16"
          >
            <a href="#features" className="inline-flex flex-col items-center text-white/50 hover:text-amber-400 transition-colors">
              <span className="text-sm mb-2">Saiba mais</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ferramentas profissionais para transformar sua loja em uma máquina de vendas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-6 rounded-2xl group hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Sistema entregue
                <span className="text-gradient block">pronto para usar</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Não perca tempo com configurações. Receba seu sistema completo, personalizado com sua marca e pronto para começar a vender.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 rounded-3xl"
            >
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Investimento único</p>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-gradient">R$ 2.997</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Pagamento único, sem mensalidades</p>
                
                <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="premium" size="xl" className="w-full mb-4">
                    <MessageCircle className="w-5 h-5" />
                    Solicitar Entrega
                  </Button>
                </a>
                
                <p className="text-xs text-muted-foreground">
                  Entrega em até 7 dias úteis
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto para revolucionar sua loja?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Entre em contato agora e receba uma demonstração gratuita do sistema
              </p>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer">
                <Button variant="premium" size="xl" className="animate-glow-pulse">
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-sm text-muted-foreground">
                AutoConnect © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/demo" className="hover:text-amber-400 transition-colors">Catálogo</Link>
              <a href="https://instagram.com/zailonsoft" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                @zailonsoft
              </a>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
