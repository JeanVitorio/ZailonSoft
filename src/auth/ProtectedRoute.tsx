// src/auth/ProtectedRoute.tsx

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Componente de carregamento com mensagens personalizadas
const FullPageLoader = ({ message, subMessage }: { message: string, subMessage: string }) => (
  <div className="flex h-screen items-center justify-center bg-zinc-50">
    <div className="text-center p-4">
      <p className="text-lg font-semibold animate-pulse text-zinc-700">{message}</p>
      <p className="text-sm text-zinc-500">{subMessage}</p>
    </div>
  </div>
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, subscription, loading: authLoading } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Este useEffect gerencia um timeout para o estado de pagamento pendente.
  useEffect(() => {
    // Se o usuário está carregado e a assinatura está pendente, iniciamos um timer.
    if (!authLoading && user && subscription?.status === 'pending_payment') {
      const timer = setTimeout(() => {
        // Se depois de 10 segundos o status não mudou, consideramos que o webhook falhou.
        console.warn("Webhook timeout. Redirecionando para a página de assinatura.");
        setTimedOut(true);
      }, 10000); // 10 segundos de tolerância para o webhook

      // Função de limpeza: se o componente re-renderizar (porque a assinatura mudou para 'active'),
      // nós limpamos o timer para evitar o redirecionamento.
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, subscription]);


  // 1. Enquanto o AuthContext carrega os dados iniciais do usuário.
  if (authLoading) {
    return <FullPageLoader message="Carregando..." subMessage="Aguarde um momento." />;
  }

  // 2. Após o carregamento, se não houver usuário, vai para o login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se a assinatura está ativa, o acesso é garantido.
  if (subscription?.status === 'active') {
    return <>{children}</>;
  }

  // 4. Se a assinatura está pendente E nosso timer ainda não estourou, mostramos o loader.
  //    O Supabase Realtime deve atualizar o 'subscription' e fazer este componente re-renderizar.
  if (subscription?.status === 'pending_payment' && !timedOut) {
    return <FullPageLoader message="Verificando sua assinatura..." subMessage="Estamos confirmando seu pagamento. Isso pode levar alguns segundos." />;
  }

  // 5. Se o status não é 'active' E (o status não é pendente OU o timer já estourou),
  //    redirecionamos para a página de pagamento.
  return <Navigate to="/assinar" replace />;
} 