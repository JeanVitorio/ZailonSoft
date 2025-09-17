import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query'; // Importamos o QueryClient

// --- Interfaces ---
interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Final com Logout "Zero Cache" ---
export function AuthProvider({ children, queryClient }: { children: ReactNode, queryClient: QueryClient }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificação inicial da sessão
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para carregar ou refrescar a assinatura
  const loadSubscription = async () => {
    if (user) {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        setSubscription(null);
      } else {
        setSubscription(subData as Subscription | null);
      }
    } else {
      setSubscription(null);
    }
  };

  // Carrega a assinatura quando o usuário muda
  useEffect(() => {
    if (!loading) {
      loadSubscription();
    }
  }, [user, loading]);

  // Função para refrescar a assinatura
  const refreshSubscription = async () => {
    await loadSubscription();
  };

  // A função de logout "Zero Cache"
  const logout = async () => {
    console.log("Iniciando logout completo e limpeza de caches...");
    
    // Etapa 1: Desloga do Supabase (limpa o cache de autenticação)
    await supabase.auth.signOut();
    console.log("Sessão Supabase encerrada.");

    // Etapa 2: Limpa o cache do React Query (limpa os dados de dashboard, etc.)
    queryClient.clear();
    console.log("Cache de dados da aplicação (React Query) limpo.");
    
    // Etapa 3: Força o redirecionamento com recarregamento completo
    // (limpa o estado do React e garante um início 100% limpo na tela de login)
    window.location.href = '/login';
  };

  const value = { user, subscription, loading, logout, refreshSubscription };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Hook de Acesso ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}