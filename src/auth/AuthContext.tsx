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
            } else {
              setSubscription(subData as Subscription | null);
            }
          } else {
            // Se não houver usuário (logout), limpa o estado da assinatura.
            setSubscription(null);
          }
        } catch (error) {
            console.error("Ocorreu um erro no listener de autenticação:", error);
        } finally {
            // ESSENCIAL: Garante que o loading termine, mesmo se ocorrer um erro.
            setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Listener para atualizações em tempo real na tabela de assinaturas
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel(`subscriptions:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime: Mudança na assinatura recebida!', payload.new);
            setSubscription(payload.new as Subscription);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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