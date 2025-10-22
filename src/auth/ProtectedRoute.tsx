import React, { useEffect } from 'react';
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

  useEffect(() => {
    console.log('ProtectedRoute - Estado atualizado:', { user: !!user, subscription, loading });
  }, [user, subscription, loading]);

  // 1. Espera o loading (auth + assinatura) terminar
  if (loading) {
    return <FullPageLoader />;
  }

  // 2. Se o loading terminou e NÃO HÁ usuário, manda pro login
  if (!user) {
    console.log('ProtectedRoute: Nenhum usuário logado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- [LÓGICA DE ROTEAMENTO ATUALIZADA] ---
  const status = subscription?.status;

  // 3. Se está 'active', libera o acesso
  if (status === 'active') {
    console.log('ProtectedRoute: Acesso liberado para rota protegida');
    return <>{children}</>;
  }

  // 4. Se o status é 'unpaid' (falha na renovação), manda para a tela de REGULARIZAR
  if (status === 'unpaid') {
    console.log(`ProtectedRoute: Assinatura 'unpaid', redirecionando para /assinar`);
    return <Navigate to="/assinar" replace />;
  }

  // 5. Para TODOS OS OUTROS casos (null, canceled, pending_payment, incomplete)
  // Manda para a tela de NOVO PAGAMENTO
  console.log(`ProtectedRoute: Status '${status}', redirecionando para /ativar-conta`);
  return <Navigate to="/ativar-conta" replace />;
}