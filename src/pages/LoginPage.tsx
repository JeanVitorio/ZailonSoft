import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Feather from 'react-feather';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha inválidos.');
        } else {
          setError('Ocorreu um erro ao tentar fazer login.');
        }
        setLoading(false);
      } else {
        navigate('/sistema');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado durante o login.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-poppins relative overflow-hidden">

      {/* --- Fundo Dark Premium com gradientes --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.15),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at top, black 40%, transparent 70%)',
          }}
        />
      </div>

      {/* GRID Responsiva */}
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 relative z-10">

        {/* COLUNA DO FORM */}
        <motion.div
          className="flex items-center justify-center py-16 px-6 sm:px-8 lg:px-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="bg-slate-950/80 border border-slate-800 shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl rounded-3xl p-8 w-full max-w-md">

            {/* LOGO */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-400/60 overflow-hidden shadow-inner grid place-items-center">
                <img
                  src="/favicon.ico"
                  alt="Logo ZailonSoft"
                  className="w-6 h-6 object-contain opacity-90"
                />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-50 tracking-tight">
                  Zailon<span className="text-amber-400">Soft</span>
                </h1>
                <p className="text-slate-400 text-sm">Pré-vendas & CRM Automotivo</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm text-center mb-6">
              Insira suas credenciais para acessar seu painel.
            </p>

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleLogin}>
              
              {/* EMAIL */}
              <div className="grid gap-2">
                <label htmlFor="email" className="text-slate-200 font-medium text-sm">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-200 placeholder-slate-500
                             focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition"
                  required
                />
              </div>

              {/* SENHA */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-slate-200 font-medium text-sm">
                    Senha
                  </label>
                  <a
                    href="https://wa.me/554691163405?text=Esqueci%20a%20senha%20do%20sistema%20ZailonSoft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    Esqueceu a senha?
                  </a>
                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="•••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-200 placeholder-slate-500
                             focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 transition"
                  required
                />
              </div>

              {/* ERRO */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-sm text-red-400 bg-red-500/10 border border-red-400/30 rounded-xl p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* BOTÃO */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-slate-950 font-semibold py-3.5 rounded-xl
                           shadow-[0_18px_40px_rgba(245,158,11,0.55)] hover:shadow-[0_24px_55px_rgba(245,158,11,0.75)]
                           transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Feather.Loader className="animate-spin" size={18} />
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Feather.LogIn size={18} />
                    Entrar no painel
                  </span>
                )}
              </motion.button>

            </form>

            {/* RODAPÉ */}
            <p className="mt-5 text-center text-sm text-slate-400">
              Não tem uma conta?{' '}
              <Link
                to="/signup"
                className="text-amber-400 font-semibold hover:text-amber-300 transition"
              >
                Criar agora
              </Link>
            </p>

          </div>
        </motion.div>

        {/* COLUNA DA IMAGEM */}
        <div className="hidden lg:block">
          <img
            src="/CamaroBranco.png"
            alt="Carro esportivo"
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
