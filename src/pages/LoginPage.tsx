import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoggedIn, lojaSlug, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already logged in with slug, redirect
  React.useEffect(() => {
    if (!authLoading && isLoggedIn && lojaSlug) {
      navigate(`/${lojaSlug}/dashboard`, { replace: true });
    }
  }, [authLoading, isLoggedIn, lojaSlug, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login?.(email, password);
      
      if (success) {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso',
        });
        // The useEffect above will handle redirect once lojaSlug loads
        // Fallback: navigate to /sistema which redirects to slug
        setTimeout(() => {
          navigate('/sistema', { replace: true });
        }, 500);
      } else {
        toast({
          title: 'Credenciais inválidas',
          description: 'Verifique seu email e senha',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <img src="/favicon.ico" alt="Logo" className="w-12 h-12 rounded-2xl shadow-glow-md" />
            <span className="text-xl font-bold text-white">AutoConnect</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Acesse sua conta para gerenciar sua loja</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm text-muted-foreground">Lembrar de mim</span>
              </label>
              <a
                href="https://wa.me/5546991163405?text=Olá, esqueci minha senha e preciso de ajuda"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Esqueci a senha
              </a>
            </div>

            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a 
              href="https://wa.me/5546991163405" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Precisa de ajuda? Fale conosco
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Gerencie sua loja com
              <span className="text-gradient block">excelência</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Plataforma completa para gestão de leads, catálogo de veículos e vendas
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
