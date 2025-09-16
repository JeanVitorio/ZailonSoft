// src/auth/AuthGuard.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Você pode reutilizar seu componente de loader ou criar um aqui
const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-zinc-50">
    <div className="text-center">
      <p className="text-lg font-semibold animate-pulse text-zinc-700">Carregando...</p>
      <p className="text-sm text-zinc-500">Aguarde um momento.</p>
    </div>
  </div>
);


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto o AuthContext verifica o usuário, mostramos o loader.
  if (loading) {
    return <FullPageLoader />;
  }

  // 2. Se, após o carregamento, não houver usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se o usuário existe, permite o acesso à página.
  return <>{children}</>;
}