// src/auth/ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

// Componente "porteiro": só deixa passar se estiver logado
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Mostra uma tela de carregamento enquanto verifica a sessão
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!user) {
        // Se não estiver carregando e não houver usuário, redireciona para o login
        return <Navigate to="/login" replace />;
    }

    // Se estiver tudo certo, mostra o conteúdo da aplicação
    return <>{children}</>;
};