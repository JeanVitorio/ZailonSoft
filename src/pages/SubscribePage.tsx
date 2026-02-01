import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { Loader2, AlertTriangle, CreditCard, ArrowLeft } from 'lucide-react';

// Página APENAS para regularizar pagamentos de renovação que falharam (status 'unpaid')
export function SubscribePage() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esta função é SÓ para abrir o Portal do Cliente
  const handleOpenPortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-customer-portal-link'
      );
      if (functionError) throw functionError;

      if (data?.portalUrl) {
        window.location.href = data.portalUrl;
        return; // Navega para o Portal do Cliente
      }
      setError(data?.error || 'Não foi possível abrir o portal de pagamento.');
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fundo no mesmo mood da home/dashboard */}
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

      <div className="relative z-10 w-full max-w-2xl">
        {/* Topo com logo / voltar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-slate-900 border border-amber-400/60 grid place-items-center">
              <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-amber-400 via-amber-300 to-orange-400" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-tight text-slate-50">
                Zailon<span className="text-amber-400">Soft</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Pré-vendas &amp; CRM Automotivo
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={13} />
            Voltar para o site
          </Link>
        </div>

        {/* “Dashboard” de cobrança */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/95 shadow-[0_24px_70px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* Barra de título estilo janela da dashboard */}
          <div className="h-10 border-b border-slate-800 flex items-center gap-2 px-4 bg-slate-950/80">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
            <span className="ml-3 text-[11px] text-slate-400 font-medium tracking-wide">
              Central de cobrança • Assinatura ZailonSoft
            </span>
          </div>

          <div className="grid md:grid-cols-[1.4fr_minmax(0,1fr)] gap-0">
            {/* Coluna principal */}
            <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-800">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-400/40 px-3 py-1 text-[11px] font-medium text-amber-200 mb-4">
                <AlertTriangle className="w-3.5 h-3.5" />
                Pagamento recusado • Acesso suspenso
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-50 mb-2">
                Não conseguimos renovar sua assinatura
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-lg leading-relaxed">
                Sua última tentativa de cobrança falhou e, por segurança, o acesso ao sistema foi
                pausado. Para reativar tudo, basta atualizar o cartão e regularizar a fatura no
                portal seguro de pagamentos.
              </p>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handleOpenPortal}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-slate-950 font-semibold text-sm sm:text-[15px] py-3 rounded-2xl shadow-[0_18px_40px_rgba(245,158,11,0.7)] hover:shadow-[0_22px_60px_rgba(245,158,11,0.9)] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Abrindo portal de pagamento...
                  </>
                ) : (
                  <>
                    Regularizar pagamento agora
                  </>
                )}
              </button>

              <button
                onClick={logout}
                className="mt-5 text-[11px] sm:text-xs text-slate-400 hover:text-amber-300 transition-colors"
              >
                Sair da conta
              </button>

              <p className="mt-3 text-[10px] sm:text-[11px] text-slate-500">
                Assim que o pagamento for confirmado no portal, o sistema reativa automaticamente
                seu acesso ao ZailonSoft.
              </p>
            </div>

            {/* Coluna lateral estilo widget da dashboard */}
            <div className="p-6 sm:p-7 bg-slate-950/90 flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-amber-300 grid place-items-center border border-slate-700">
                  <CreditCard size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.12em] mb-1">
                    Status da assinatura
                  </p>
                  <p className="text-xs text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-400/40 px-2.5 py-1 text-[11px] text-red-200 mr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Pagamento recusado
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Ajuste o cartão e a fatura pendente no portal para voltar a usar o sistema.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assinatura</span>
                  <span className="font-medium text-slate-100">ZailonSoft (mensal)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Próxima cobrança</span>
                  <span className="font-medium text-slate-100">Ver no portal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Forma de pagamento</span>
                  <span className="font-medium text-slate-100">Atualizar no portal</span>
                </div>
                <p className="pt-2 text-[10px] text-slate-500">
                  Todas as alterações de cartão e cobrança são feitas em ambiente seguro pelo
                  provedor de pagamentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
