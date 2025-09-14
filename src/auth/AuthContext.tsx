// src/auth/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

// Define o tipo da nossa assinatura
interface Subscription {
  status: string | null;
}

// Define o que nosso contexto vai fornecer para a aplicação
interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o Provedor que vai gerenciar o estado
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // --- MUDANÇA PRINCIPAL ---
  // Este useEffect agora lida com o carregamento inicial de forma mais robusta
  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Pega o usuário da sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. Se houver um usuário, busca a assinatura dele
      if (currentUser) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .single();
        setSubscription(subData as Subscription | null);
      }
      
      // 3. Só então, diz que o carregamento terminou
      setLoading(false);
    };

    fetchInitialData();

    // Mantemos o listener para reagir a logins e logouts que aconteçam
    // depois que a página já carregou.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setSubscription(null); // Limpa a assinatura antiga
        
        if (currentUser) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', currentUser.id)
            .single();
          setSubscription(subData as Subscription | null);
        }
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

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}