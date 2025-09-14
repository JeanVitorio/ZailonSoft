// src/auth/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChange é nossa fonte única da verdade.
    // Ele roda uma vez no carregamento inicial e depois sempre que o estado de auth muda.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setSubscription(null); // Limpa a assinatura antiga para evitar mostrar dados errados

        if (currentUser) {
          // Se um usuário for encontrado, busca a assinatura dele
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', currentUser.id)
            .single();
          setSubscription(subData as Subscription | null);
        }
        
        // Só finaliza o carregamento DEPOIS de ter verificado o usuário E a assinatura
        setLoading(false);
      }
    );

    // Função de limpeza
    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeAllChannels();
    };
  }, []);

  // Este useEffect para o Realtime escuta por mudanças no banco de dados
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel(`subscriptions:${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}`},
          (payload) => {
            console.log('Mudança na assinatura recebida em tempo real!', payload.new);
            setSubscription(payload.new as Subscription);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    // A navegação agora é mais simples, o listener vai cuidar de limpar o estado
    navigate('/login');
  };

  const value = { user, subscription, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}