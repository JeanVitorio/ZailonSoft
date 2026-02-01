// src/pages/SignUpPage.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'start-subscription',
        {
          body: { fullName, storeName, whatsapp, email, password },
        }
      );

      if (functionError) throw functionError;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(
          data?.error ||
            'Não foi possível iniciar o processo de assinatura. Tente novamente.'
        );
      }
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-slate-50 font-poppins relative overflow-hidden flex items-center justify-center px-4">
      {/* Fundo dark premium no mesmo mood da Home */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.18),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(30,64,175,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,64,175,0.16) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(circle at top, black 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-center">
        {/* Coluna formulário */}
        <div className="flex items-center justify-center">
          <motion.div
            className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] p-6 sm:p-8 backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Cabeçalho com logo, igual vibe da home */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-amber-400/60 overflow-hidden shadow-inner grid place-items-center">
                    <img
                        src="/favicon.ico"
                        alt="Logo ZailonSoft"
                        className="w-6 h-6 object-contain opacity-90"
                    />
                </div>
                <div className="flex flex-col leading-tight">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-50">
                    Zailon<span className="text-amber-400">Soft</span>
                  </h1>
                  <span className="text-[11px] text-slate-400">
                    Pré-vendas &amp; CRM Automotivo
                  </span>
                </div>
              </div>

              <Link
                to="/login"
                className="hidden sm:inline-flex items-center text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
              >
                Já tem conta?
              </Link>
            </div>

            <div className="mb-6">
              <p className="text-xs sm:text-sm text-slate-300">
                Crie sua conta para colocar seu pré-vendas no automático e deixar seus
                vendedores só com leads prontos para comprar.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-xs text-slate-300">
                    Seu Nome
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Ex: João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus-visible:ring-amber-500/40 focus-visible:border-amber-400/80"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storeName" className="text-xs text-slate-300">
                    Nome da Loja
                  </Label>
                  <Input
                    id="storeName"
                    placeholder="Ex: Silva Veículos"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus-visible:ring-amber-500/40 focus-visible:border-amber-400/80"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp" className="text-xs text-slate-300">
                  WhatsApp da Loja
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="Ex: 5546999999999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus-visible:ring-amber-500/40 focus-visible:border-amber-400/80"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs text-slate-300">
                  E-mail de Acesso
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usado para login"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus-visible:ring-amber-500/40 focus-visible:border-amber-400/80"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs text-slate-300">
                  Crie uma Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus-visible:ring-amber-500/40 focus-visible:border-amber-400/80"
                />
              </div>

              {error && (
                <p className="text-xs sm:text-sm font-medium text-red-200 bg-red-500/10 border border-red-500/40 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-slate-950 font-semibold border-none shadow-[0_18px_40px_rgba(245,158,11,0.7)] hover:shadow-[0_22px_60px_rgba(245,158,11,0.9)] hover:from-amber-200 hover:via-amber-500 hover:to-orange-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta e Assinar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-[11px] sm:text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-amber-300 font-semibold hover:text-amber-200 underline-offset-2 hover:underline"
              >
                Faça login
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Coluna imagem / highlight do produto */}
        <div className="hidden lg:block relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-[0_24px_70px_rgba(0,0,0,0.9)]">
          <img
            src="/CamaroBranco.png"
            alt="Loja de veículos usando o ZailonSoft"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-amber-300 uppercase">
              Pré-vendas automático
            </p>
            <p className="text-sm sm:text-base font-semibold text-slate-50">
              Deixe o ZailonSoft fazer o primeiro atendimento, qualificar os leads e mandar para
              o vendedor só quem realmente quer comprar.
            </p>
            <p className="text-[11px] text-slate-300">
              Em menos de 24h seu pré-vendas pode estar rodando com formulários, funis e
              dashboards configurados para sua loja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
