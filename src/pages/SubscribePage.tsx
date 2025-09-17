import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { Loader2 } from 'lucide-react';

// Componente principal para a página de assinatura
export function SubscribePage() {
  const { user, subscription, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Você precisa estar logado para (re)ativar uma assinatura.');
      setLoading(false);
      return;
    }

    try {
      console.log('Gerando link de checkout para user_id:', user.id);
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-link');

      if (functionError) {
        console.error('Erro ao chamar função create-checkout-link:', functionError);
        throw functionError;
      }

      if (data?.checkoutUrl) {
        console.log('Link de checkout gerado:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        setError(data?.error || 'Não foi possível gerar o link de pagamento. Tente novamente.');
      }
    } catch (e: any) {
      console.error('Erro ao criar link de checkout:', e);
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  // Determina a mensagem com base no status da assinatura
  let message = '';
  if (!subscription) {
    message = 'Você ainda não assinou. Por favor, assine para continuar.';
  } else if (subscription.status === 'pending_payment' || subscription.status === 'incomplete') {
    message = 'Regularize a mensalidade para acessar o sistema.';
  } else if (subscription.status === 'canceled') {
    message = 'Sua assinatura foi cancelada. Por favor, reative.';
  } else {
    message = 'Status da assinatura desconhecido. Por favor, entre em contato com o suporte.';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-100 text-center p-4 font-poppins">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <svg
          className="w-16 h-16 mx-auto text-amber-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>

        <h1 className="text-2xl font-bold text-zinc-800 mb-3">Gerenciar Assinatura</h1>

        <p className="text-md text-zinc-600 mb-6">{message}</p>

        {error && (
          <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando link...
            </>
          ) : (
            'P-when / Assinar Agora'
          )}
        </button>

        <button onClick={logout} className="mt-6 text-sm text-zinc-500 hover:underline">
          Sair da conta
        </button>
      </div>
    </div>
  );
}