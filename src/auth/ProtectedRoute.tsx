// src/auth/ProtectedRoute.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Um componente de carregamento mais informativo
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-zinc-50 text-zinc-700 font-poppins">
    <div className="text-center">
        {/* Você pode adicionar sua logo ou um spinner aqui */}
        <p className="text-lg font-semibold animate-pulse">Verificando sua assinatura...</p>
        <p className="text-sm text-zinc-500">Isso pode levar alguns segundos após o pagamento.</p>
    </div>
  </div>
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, subscription, loading: authLoading } = useAuth();
  const location = useLocation();

  // 1. Se o contexto principal ainda está carregando o usuário, esperamos.
  if (authLoading) {
    return <FullPageLoader />;
  }

  // 2. Se não houver usuário, redirecionamos para o login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 3. Se a assinatura já está ativa, liberamos o acesso imediatamente.
  if (subscription?.status === 'active') {
    return <>{children}</>;
  }

  // 4. Se a assinatura está pendente, exibimos a tela de "Verificando..."
  //    O Supabase Realtime (que configuramos no AuthContext) irá atualizar o 'subscription'
  //    em segundo plano. Quando o status mudar para 'active', este componente vai
  //    re-renderizar e entrar na condição 3, liberando o acesso.
  if (subscription?.status === 'pending_payment') {
      return <FullPageLoader />;
  }

  // 5. Se a assinatura tiver qualquer outro status (ex: 'canceled', 'unpaid', ou não existir),
  //    aí sim redirecionamos para a página de pagamento.
  return <Navigate to="/assinar" replace />;
}