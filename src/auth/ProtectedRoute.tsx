import React from 'react';
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
  const { user, subscription, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (subscription?.status !== 'active') {
    return <Navigate to="/assinar" replace />;
  }

  return <>{children}</>;
}