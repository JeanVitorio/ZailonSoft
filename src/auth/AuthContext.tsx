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

  // Este useEffect agora também escuta por mudanças em tempo real
  useEffect(() => {
    // Função para buscar os dados iniciais
    const fetchInitialData = async (currentUser: User | null) => {
      if (currentUser) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .single();
        setSubscription(subData as Subscription | null);
      }
      setLoading(false);
    };

    // Pega a sessão inicial para evitar tela de carregamento em reloads
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchInitialData(currentUser);
    });

    // Escuta por mudanças no login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setSubscription(null);
        if (!currentUser) {
            setLoading(false);
        } else {
            fetchInitialData(currentUser);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      // Remove todos os listeners de canais quando o componente desmontar
      supabase.removeAllChannels();
    };
  }, []);

  // <-- MUDANÇA REALTIME: Este novo useEffect escuta o banco de dados
  useEffect(() => {
    // Só cria o listener se tivermos um usuário logado
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
            // O webhook atualizou o DB! Vamos atualizar nosso estado no frontend.
            console.log('Mudança na assinatura recebida em tempo real!', payload.new);
            setSubscription(payload.new as Subscription);
          }
        )
        .subscribe();

      // Função de limpeza para remover o listener quando o usuário mudar
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]); // Roda sempre que o objeto 'user' mudar

  const logout = async () => {
    await supabase.auth.signOut();
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