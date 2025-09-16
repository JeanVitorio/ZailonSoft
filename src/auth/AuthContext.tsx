import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

// --- Interfaces ---
interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para o cache
const SUBSCRIPTION_CACHE_KEY = 'zailon_subscription_status';

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    try {
      const cachedSub = sessionStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      return cachedSub ? JSON.parse(cachedSub) : null;
    } catch {
      console.warn('Falha ao carregar assinatura do cache');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para carregar dados da assinatura
    const loadSubscription = async (userId: string | null) => {
      if (!userId) {
        setSubscription(null);
        sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        return;
      }
      try {
        console.log(`Buscando assinatura para user_id: ${userId}`);
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', userId)
          .maybeSingle(); // Usar maybeSingle para lidar com casos onde não há assinatura

        if (subError) {
          console.error('Erro ao buscar assinatura:', subError.message, subError.details, subError.hint);
          setSubscription(null);
          sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        } else if (subData) {
          console.log('Assinatura encontrada:', subData);
          setSubscription(subData as Subscription);
          sessionStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subData));
        } else {
          console.log('Nenhuma assinatura encontrada para o usuário');
          setSubscription(null);
          sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        }
      } catch (error) {
        console.error('Erro inesperado ao carregar assinatura:', error);
        setSubscription(null);
        sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      }
    };

    // Função para lidar com a sessão
    const handleSession = async () => {
      try {
        console.log('Verificando sessão inicial');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao obter sessão:', error.message);
          throw error;
        }
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        console.log('Usuário atual:', currentUser ? currentUser.id : 'Nenhum usuário');
        await loadSubscription(currentUser?.id ?? null);
      } catch (error) {
        console.error('Erro na verificação de sessão:', error);
        setUser(null);
        setSubscription(null);
        sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      } finally {
        setLoading(false);
        console.log('Estado de loading finalizado');
      }
    };

    // Executa a verificação inicial
    handleSession();

    // Configura o listener de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Evento de autenticação:', _event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await loadSubscription(currentUser?.id ?? null);
      setLoading(false);
    });

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Timeout atingido: forçando o fim do estado de loading');
        setLoading(false);
      }
    }, 10000); // 10 segundos

    return () => {
      console.log('Limpando listener e timeout');
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const logout = async () => {
    try {
      console.log('Iniciando logout');
      await supabase.auth.signOut();
      setUser(null);
      setSubscription(null);
      sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      console.log('Logout concluído');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = { user, subscription, loading, logout };

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