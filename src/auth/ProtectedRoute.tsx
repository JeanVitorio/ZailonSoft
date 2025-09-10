// src/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // MUDANÇA AQUI: Lógica de redirecionamento mais inteligente
  if (subscriptionStatus === 'active') {
    // 1. Se a assinatura está ativa, libera o acesso.
    return <>{children}</>;
  } else if (subscriptionStatus === 'payment_failed') {
    // 2. Se o pagamento falhou, manda para a tela de regularização.
    return <Navigate to="/regularizar-pagamento" replace />;
  } else {
    // 3. Para qualquer outro caso (not_subscribed, cancelled, null), manda para a tela de assinatura.
    return <Navigate to="/assinar" replace />;
  }
};