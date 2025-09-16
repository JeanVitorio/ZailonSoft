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
  loading: boolean; // Indica a verificação em segundo plano
  logout: () => Promise<void>;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para o cache
const SUBSCRIPTION_CACHE_KEY = 'zailon_subscription_status';

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Tenta carregar o estado inicial da assinatura do cache para uma resposta rápida da UI
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
    // A verificação inicial da sessão é crucial
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            setLoading(false);
            sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            const { data: subData, error: subError } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('user_id', currentUser.id)
              .single();

            if (subError) {
              console.error('Erro ao buscar assinatura:', subError.message);
              setSubscription(null);
              sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY); // Limpa cache em caso de erro
            } else {
              setSubscription(subData as Subscription | null);
              // Salva o resultado mais recente no cache
              sessionStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subData));
            }
          } else {
            setSubscription(null);
            // Limpa o cache no logout
            sessionStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
          }
        } catch (error) {
            console.error("Ocorreu um erro no listener de autenticação:", error);
        } finally {
            // Garante que o loading termine, mesmo se ocorrer um erro.
            setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    // O listener onAuthStateChange cuidará de limpar os estados e o cache.
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