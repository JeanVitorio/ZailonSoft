import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Feather from 'react-feather';

// --- Componentes de Background ---
const LightDotsBackground = () => {
  const [dots, setDots] = useState<any[]>([]);
  React.useEffect(() => {
    const generateDots = () => {
      const newDots = Array.from({ length: 70 }).map(() => ({
        id: Math.random(), top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 8 + 8}s`, animationDelay: `${Math.random() * 8}s`,
        size: `${Math.random() * 2 + 1}px`, opacity: `${Math.random() * 0.4 + 0.3}`,
      }));
      setDots(newDots);
    };
    generateDots();
  }, []);
  return (
    <>
      <style>{`@keyframes move-dots { from { transform: translateY(0px); } to { transform: translateY(-1500px); } } .light-dot { animation: move-dots linear infinite; position: absolute; background-color: #a1a1aa; border-radius: 50%; z-index: -20; }`}</style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {dots.map(dot => (<div key={dot.id} className="light-dot" style={{ top: dot.top, left: dot.left, animationDuration: dot.animationDuration, animationDelay: dot.animationDelay, width: dot.size, height: dot.size, opacity: dot.opacity, }}/>))}
      </div>
    </>
  );
};
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c740,transparent)]"></div>
  </div>
);

// --- Componente Principal ---
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
      } else {
        navigate('/sistema');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado durante o login.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
      <LightDotsBackground />
      <AnimatedBackground />
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <motion.div
          className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="mx-auto grid w-[350px] gap-6 bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm backdrop-blur-sm">
            <div className="grid gap-2 text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Feather.BarChart2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900">
                    Zailon<span className="text-amber-500">Soft</span>
                  </h1>
                  <p className="text-zinc-600">CRM Automotivo</p>
                </div>
              </div>
              <p className="text-zinc-600">
                Insira as suas credenciais para acessar o seu painel.
              </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-zinc-800 font-medium">E-mail</label>
                <input
                  id="email" type="email" placeholder="seu@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-zinc-800 font-medium">Senha</label>
                  <Link to="/forgot-password" className="text-sm text-amber-500 hover:text-amber-600 transition-colors">
                    Esqueceu a sua senha?
                  </Link>
                </div>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm font-medium text-red-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                type="submit"
                className="w-full bg-amber-500 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)]"
                disabled={loading}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Verificando...' : <><Feather.LogIn size={18} /> Entrar no Painel</>}
              </motion.button>
            </form>
            <div className="mt-4 text-center text-sm text-zinc-600">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-amber-500 font-semibold hover:text-amber-600 transition-colors">
                Crie uma agora
              </Link>
            </div>
          </div>
        </motion.div>
        <div className="hidden bg-zinc-100 lg:block">
          <img
            src="/CamaroBranco.png"
            alt="Imagem de um carro desportivo"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}