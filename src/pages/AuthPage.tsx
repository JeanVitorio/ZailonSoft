import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUp(email, password, nome);
      if (result.error) {
        setError(result.error.message);
      } else {
        setSignupSuccess(true);
        setMode('login');
        setPassword('');
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error.message);
      }
    }
    setLoading(false);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background gradient-mesh noise-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent/60 flex items-center justify-center mx-auto mb-5 shadow-2xl relative overflow-hidden"
          >
            <span className="text-4xl font-black text-primary-foreground relative z-10">Z</span>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </motion.div>
          <h1 className="text-2xl font-black text-foreground mb-2">Zailon</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Configure as variáveis de ambiente do Supabase para ativar a autenticação.
          </p>
          <div className="glass-card rounded-2xl p-5 text-left text-xs text-muted-foreground space-y-2">
            <p className="font-bold text-foreground text-sm">Variáveis necessárias:</p>
            <code className="block px-3 py-1.5 rounded-lg bg-secondary text-primary font-mono">VITE_SUPABASE_URL</code>
            <code className="block px-3 py-1.5 rounded-lg bg-secondary text-primary font-mono">VITE_SUPABASE_ANON_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh noise-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent/60 flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden"
          >
            <span className="text-4xl font-black text-primary-foreground relative z-10">Z</span>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </motion.div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Zailon</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta e comece agora'}
          </p>
        </div>

        {signupSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">Conta criada!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verifique seu e-mail para confirmar.
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Seu nome" required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-card text-foreground text-sm font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-card text-foreground text-sm font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Senha" required minLength={6}
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass-card text-foreground text-sm font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive font-semibold text-center py-1">{error}</motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl gradient-cta text-accent-foreground font-extrabold text-base disabled:opacity-40 shadow-xl shadow-accent/20 flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}</span>
            {!loading && <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </motion.button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSignupSuccess(false); }}
          className="w-full mt-6 text-center text-sm text-muted-foreground"
        >
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span className="font-bold text-primary hover:underline">{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</span>
        </button>
      </motion.div>
    </div>
  );
}
