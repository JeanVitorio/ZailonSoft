import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import crownBadge from '@/assets/crown-badge.png';

export default function AuthPage() {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, nome);

    if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <img src={crownBadge} alt="Zailon" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Zailon</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Configure as variáveis de ambiente do Supabase para ativar a autenticação.
          </p>
          <div className="bg-card rounded-xl p-4 card-shadow border border-border text-left text-xs text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">Variáveis necessárias:</p>
            <code className="block">VITE_SUPABASE_URL</code>
            <code className="block">VITE_SUPABASE_ANON_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src={crownBadge} alt="Zailon" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-foreground">Zailon</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Entra aí, guerreiro!' : 'Cria tua conta e domina!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Teu nome"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive font-semibold text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-cta text-accent-foreground font-extrabold text-base disabled:opacity-40"
          >
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar 🚀' : 'Criar Conta 🎮'}
          </motion.button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          className="w-full mt-4 text-center text-sm text-muted-foreground"
        >
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span className="font-bold text-cta">{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</span>
        </button>
      </motion.div>
    </div>
  );
}
