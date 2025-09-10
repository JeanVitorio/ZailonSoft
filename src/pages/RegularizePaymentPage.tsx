// src/pages/RegularizePaymentPage.tsx

import React from 'react';
import { useAuth } from '../auth/AuthContext'; // Importe o useAuth para o botão de sair

export function RegularizePaymentPage() {
    const { logout } = useAuth();

    // Esta função direciona o cliente para a central de assinaturas do Mercado Pago
    const handleRegularize = () => {
        // O link correto é este. Veja a explicação abaixo.
        window.location.href = 'https://www.mercadopago.com.br/subscriptions';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-100 text-center p-4 font-poppins">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                
                <h1 className="text-2xl font-bold text-zinc-800 mb-3">Pagamento Pendente</h1>
                
                <p className="text-md text-zinc-600 mb-6">
                    Olá! Identificamos um problema com o pagamento da sua assinatura. Para continuar acessando todos os recursos da ZailonSoft, por favor, atualize seu meio de pagamento.
                </p>

                <button
                    onClick={handleRegularize}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mb-4"
                >
                    Regularizar Mensalidade Agora
                </button>

                <button 
                    onClick={logout} 
                    className="text-sm text-zinc-500 hover:underline"
                >
                    Sair e tentar novamente mais tarde
                </button>
            </div>
        </div>
    );
}