// src/auth/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface Subscription {
  status: string | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSubscription = async (currentUser: User | null) => {
      if (currentUser) {
        const { data: subData, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = "A consulta não retornou nenhuma linha" (o que é normal se não houver assinatura)
            console.error("Erro ao buscar assinatura:", error);
        }
        
        setSubscription(subData as Subscription | null);
      } else {
        // Se não há usuário, não há assinatura
        setSubscription(null);
      }
      // Marcamos o carregamento como concluído APÓS buscar tudo
      setLoading(false);
    };

    // Pega a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchUserAndSubscription(currentUser);
    });

    // Escuta por mudanças no login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        // Se o usuário mudou, entramos em estado de loading novamente
        setLoading(true);
        setUser(currentUser);
        await fetchUserAndSubscription(currentUser); // Aguarda a busca antes de finalizar o loading (dentro da função)
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeAllChannels();
    };
  }, []);
  
  // Efeito para o Realtime (escuta de mudanças no DB)
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel(`realtime-subscriptions:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Mudança na assinatura recebida em tempo real!', payload.new);
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
    // O onAuthStateChange cuidará de limpar os estados user e subscription
  };

  const value = { user, subscription, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}