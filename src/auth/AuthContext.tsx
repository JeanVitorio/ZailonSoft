// src/auth/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

// Define o tipo da assinatura para usarmos no nosso contexto
interface Subscription {
  status: string | null;
  // adicione outros campos da sua tabela de assinaturas se precisar
}

// Define o que nosso contexto vai fornecer
interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o provedor do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados da sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    // Escuta por mudanças no estado de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Se houver um usuário, busca o status da assinatura dele
        if (currentUser) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', currentUser.id)
            .single();
          setSubscription(subData as Subscription | null);
        } else {
          setSubscription(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setSubscription(null);
  };

  const value = {
    user,
    subscription,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para usar o contexto facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}