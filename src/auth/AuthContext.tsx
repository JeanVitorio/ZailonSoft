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
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para carregar informações do usuário e assinatura
    const loadUserData = async (currentUser: User | null) => {
      try {
        if (currentUser) {
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', currentUser.id)
            .single();

          if (subError) {
            console.error('Erro ao buscar assinatura:', subError.message);
            setSubscription(null);
            sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
          } else {
            setSubscription(subData as Subscription | null);
            sessionStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subData));
          }
        } else {
          setSubscription(null);
          sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setSubscription(null);
        sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      } finally {
        setLoading(false);
      }
    };

    // Verificação inicial da sessão
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        await loadUserData(session?.user ?? null);
      } catch (error) {
        console.error('Erro na verificação inicial da sessão:', error);
        setUser(null);
        setSubscription(null);
        sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        setLoading(false);
      }
    };

    checkInitialSession();

    // Listener para mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await loadUserData(currentUser);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // O listener onAuthStateChange cuidará de limpar os estados
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