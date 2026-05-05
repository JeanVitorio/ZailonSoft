import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import jvsLogo from '@/assets/jvs-logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { login, isLoggedIn, lojaSlug, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && isLoggedIn && lojaSlug) {
      navigate(`/${lojaSlug}/dashboard`, { replace: true });
    }
  }, [authLoading, isLoggedIn, lojaSlug, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const success = await login?.(email, password);
      if (success) {
        toast({ title: 'Bem-vindo!' });
        setRedirecting(true);
      } else {
        toast({ title: 'Credenciais inválidas', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={jvsLogo} alt="NILO" className="w-10 h-10" />
              <span className="text-xl font-bold text-foreground">NILO</span>
            </Link>
            <ThemeToggle />
          </div>

          <motion.form onSubmit={handleLogin} className="space-y-5">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Acesso da loja</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Entre com o login que recebeu da equipe JVS Soluções.
            </p>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-12 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading || redirecting}>
              {isLoading || redirecting ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.form>

          <div className="mt-8 p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Ainda não tem acesso? Adquira o sistema falando direto com a gente:
            </p>
            <a href="https://wa.me/5546991163405?text=Olá! Quero adquirir o sistema da JVS Soluções" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-4 h-4" />
                Adquirir pelo WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/15 to-emerald-500/15" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <img src={jvsLogo} alt="NILO" className="w-24 h-24 mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Gerencie sua loja com
              <span className="text-gradient block">excelência</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              Plataforma completa para gestão de leads, catálogo de veículos e vendas
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
