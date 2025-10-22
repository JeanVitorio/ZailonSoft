import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { Loader2, CreditCard } from 'lucide-react'; // Ícone de Cartão

// Página para o primeiro pagamento / reativação de conta cancelada
export function ActivateAccountPage() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esta função é SÓ para criar uma NOVA assinatura
  const handleCreateSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-link');
      if (functionError) throw functionError;
      
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return; // Navega para o Stripe
      }
      setError(data?.error || 'Não foi possível gerar o link de pagamento.');
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-100 text-center p-4 font-poppins">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        
        <CreditCard className="w-16 h-16 mx-auto text-amber-500 mb-4" />
        
        <h1 className="text-2xl font-bold text-zinc-800 mb-3">Ative sua Conta</h1>
        <p className="text-md text-zinc-600 mb-6">
          Para ter acesso à plataforma, é preciso pagar a mensalidade para ativar sua conta.
        </p>

        {error && (
          <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>
        )}

        <button
          onClick={handleCreateSubscription}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aguarde...
            </>
          ) : (
            'Pagar Mensalidade e Ativar'
          )}
        </button>

        <button onClick={logout} className="mt-6 text-sm text-zinc-500 hover:underline">
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default ActivateAccountPage; // Adicione o export default