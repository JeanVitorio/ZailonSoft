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

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange é a ÚNICA fonte da verdade.
    // Ele lida com o carregamento inicial, logins e logouts.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setLoading(true); // Começa a carregar sempre que o estado de auth muda
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            // Se há um usuário, buscamos sua assinatura.
            const { data: subData, error: subError } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('user_id', currentUser.id)
              .maybeSingle(); // .maybeSingle() é seguro se o usuário não tiver assinatura

            if (subError) {
              console.error('AuthContext Erro: Falha ao buscar assinatura.', subError);
              setSubscription(null);
            } else {
              setSubscription(subData as Subscription | null);
            }
          } else {
            // Se não houver usuário (logout), limpa a assinatura.
            setSubscription(null);
          }
        } catch (error) {
          console.error('AuthContext Erro: Ocorreu um erro inesperado.', error);
          setUser(null);
          setSubscription(null);
        } finally {
          // Garante que o estado de carregamento termine, aconteça o que acontecer.
          setLoading(false);
        }
      }
    );

    // Função de limpeza
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
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