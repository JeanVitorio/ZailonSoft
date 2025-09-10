// src/auth/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  subscriptionStatus: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionAndSubscription = async (currentUser: User | null) => {
      if (currentUser) {
        // MUDANÇA AQUI: Removemos o .single() para evitar o erro 406
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .limit(1); // Pegamos no máximo 1 resultado

        if (error) {
          console.error("Erro ao buscar assinatura:", error);
          setSubscriptionStatus(null);
        } else if (data && data.length > 0) {
          // Se encontrou um registro, define o status
          setSubscriptionStatus(data[0].status);
        } else {
          // Se não encontrou NENHUMA linha, o usuário não tem uma assinatura.
          // Isso NÃO é um erro, é um estado válido que chamaremos de 'not_subscribed'.
          setSubscriptionStatus('not_subscribed');
        }
      } else {
        setSubscriptionStatus(null);
      }
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      await getSessionAndSubscription(session?.user ?? null);
      setLoading(false);
    };
    checkInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await getSessionAndSubscription(session?.user ?? null);
      setLoading(false);

      if (_event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value = { session, user, subscriptionStatus, loading, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};