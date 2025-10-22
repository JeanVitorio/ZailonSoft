import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

// --- Interfaces ---
interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | 'unpaid' | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean; // <- Este agora é um loading combinado
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children, queryClient }: { children: ReactNode, queryClient: QueryClient }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Loading da sessão
  const [subLoading, setSubLoading] = useState(true);   // Loading da assinatura

  // Função para carregar ou refrescar a assinatura
  const loadSubscription = async (currentUserId: string | undefined) => {
    if (currentUserId) {
      setSubLoading(true); // Inicia o loading da assinatura
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (subError) {
        console.error("Erro ao carregar assinatura:", subError.message);
        setSubscription(null);
      } else {
        setSubscription(subData as Subscription | null);
      }
      setSubLoading(false); // Finaliza o loading da assinatura
    } else {
      setSubscription(null);
      setSubLoading(false); // Finaliza o loading (sem usuário)
    }
  };

  useEffect(() => {
    // 1. Verificação inicial da sessão
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false); // Auth está pronto
      await loadSubscription(currentUser?.id); // Carrega a assinatura
    };

    checkSession();

    // 2. Listener para mudanças de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false); // Garante que authLoading seja false
      loadSubscription(currentUser?.id); // Recarrega a assinatura no login/logout
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // Função pública para refrescar
  const refreshSubscription = async () => {
    await loadSubscription(user?.id);
  };

  // A função de logout "Zero Cache"
  const logout = async () => {
    console.log("Iniciando logout completo e limpeza de caches...");
    await supabase.auth.signOut();
    queryClient.clear();
    // Limpa os estados locais antes de redirecionar
    setUser(null);
    setSubscription(null);
    window.location.href = '/login';
  };

  // O loading combinado: A app está carregando se o auth não foi checado
  // OU se o auth foi checado, temos um usuário, mas a assinatura dele ainda não carregou.
  const loading = authLoading || (!!user && subLoading);

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