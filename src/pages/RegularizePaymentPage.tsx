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
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-center p-4 font-poppins">
            <div className="bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-800 max-w-md w-full">
                {/* Ícone de Alerta (Estilo Dark) */}
                <svg 
                    className="w-16 h-16 mx-auto text-red-400 mb-4" // Cor de alerta ajustada
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                
                <h1 className="text-2xl font-bold text-slate-50 mb-3">Pagamento Pendente</h1>
                
                <p className="text-md text-slate-400 mb-6">
                    Olá! Identificamos um problema com o pagamento da sua assinatura. Para continuar acessando todos os recursos da ZailonSoft, por favor, atualize seu meio de pagamento.
                </p>

                {/* Botão de Ação Primária (Estilo Emerald) */}
                <button
                    onClick={handleRegularize}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 px-6 rounded-lg shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 mb-4"
                >
                    Regularizar Mensalidade Agora
                </button>

                {/* Botão Secundário (Sair) */}
                <button 
                    onClick={logout} 
                    className="text-sm text-slate-500 hover:text-slate-400 hover:underline"
                >
                    Sair e tentar novamente mais tarde
                </button>
            </div>
        </div>
    );
}