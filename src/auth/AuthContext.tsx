// src/auth/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

// --- Interfaces ---
interface Subscription {
  // Usamos tipos literais para um código mais seguro e previsível
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
    // onAuthStateChange lida tanto com o carregamento inicial da sessão quanto com mudanças (login/logout).
    // Ele dispara imediatamente com a sessão atual, tornando getSession() redundante aqui.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Se houver um usuário, buscamos sua assinatura.
        if (currentUser) {
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', currentUser.id)
                .single();
            setSubscription(subData as Subscription | null);
        } else {
            // Se não houver usuário (logout), limpamos o estado da assinatura.
            setSubscription(null);
        }
        
        // **A CORREÇÃO PRINCIPAL**: O loading só termina DEPOIS que tudo foi verificado.
        setLoading(false);
      }
    );

    // Função de limpeza para desinscrever o listener quando o componente desmontar.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Listener para atualizações em tempo real na tabela de assinaturas (ex: via Webhook)
  useEffect(() => {
    // Só cria o listener se tivermos um usuário logado.
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

      // Função de limpeza para remover o listener quando o usuário mudar ou deslogar.
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]); // Roda sempre que o objeto 'user' mudar

  const logout = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange cuidará de limpar os estados de user e subscription.
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