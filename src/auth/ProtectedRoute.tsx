import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Componente de carregamento
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-zinc-50">
    <div className="text-center p-4">
      <p className="text-lg font-semibold animate-pulse text-zinc-700">Carregando...</p>
      <p className="text-sm text-zinc-500">Aguarde um momento.</p>
    </div>
  </div>
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, subscription, loading, refreshSubscription } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Estado atualizado:', { user: !!user, subscription, loading });
  }, [user, subscription, loading]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    console.log('ProtectedRoute: Nenhum usuário logado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (subscription === null) {
    console.log('ProtectedRoute: Aguardando carregamento da assinatura...');
    return <FullPageLoader />;
  }

  if (subscription.status !== 'active') {
    console.log('ProtectedRoute: Assinatura não ativa, redirecionando para /assinar');
    return <Navigate to="/assinar" replace />;
  }

  console.log('ProtectedRoute: Acesso liberado para rota protegida');
  return <>{children}</>;
}