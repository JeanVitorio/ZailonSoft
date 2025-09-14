// src/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const FullPageLoader = () => (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center p-4">
            <p className="text-lg font-semibold animate-pulse text-zinc-700">Carregando...</p>
        </div>
    </div>
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Se o AuthContext ainda está carregando a sessão inicial.
  if (loading) {
    return <FullPageLoader />;
  }

  // 2. Se não há usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se há um usuário, libera o acesso. A verificação da assinatura
  //    será feita diretamente no banco de dados ao tentar salvar algo.
  return <>{children}</>;
}