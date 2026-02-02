import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | 'unpaid' | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  lojaId: string | null;
  lojaLoading: boolean;
  login?: (email: string, password: string) => Promise<boolean>;
  signup?: (email: string, password: string, meta?: Record<string, any>) => Promise<boolean>;
  isLoggedIn?: boolean;
  isActive?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, queryClient }: { children: ReactNode; queryClient?: QueryClient }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [lojaLoading, setLojaLoading] = useState(true);

  const loadSubscription = async (currentUserId: string | undefined) => {
    if (currentUserId) {
      setSubLoading(true);
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (subError) {
        console.error('Erro ao carregar assinatura:', subError.message);
        setSubscription(null);
      } else {
        setSubscription(subData as Subscription | null);
      }
      setSubLoading(false);
    } else {
      setSubscription(null);
      setSubLoading(false);
    }
  };

  const loadLojaId = async (currentUserId: string | undefined) => {
    if (currentUserId) {
      setLojaLoading(true);
      const { data: lojaData, error: lojaError } = await supabase
        .from('lojas')
        .select('id')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (lojaError) {
        console.error('Erro ao carregar loja:', lojaError.message);
        setLojaId(null);
      } else {
        setLojaId(lojaData?.id ?? null);
      }
      setLojaLoading(false);
    } else {
      setLojaId(null);
      setLojaLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);

      const loadPromises = [
        loadSubscription(currentUser?.id),
        loadLojaId(currentUser?.id),
      ];
      await Promise.all(loadPromises);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);
      loadSubscription(currentUser?.id);
      loadLojaId(currentUser?.id);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshSubscription = async () => {
    await loadSubscription(user?.id);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }
    return true;
  };

  const signup = async (email: string, password: string, meta: Record<string, any> = {}): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password }, { data: meta });
    if (error) {
      console.error('Signup error:', error.message);
      return false;
    }
    return !!data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    if (queryClient) queryClient.clear();
    setUser(null);
    setSubscription(null);
    setLojaId(null);
    window.location.href = '/login';
  };

  const loading = authLoading || subLoading || lojaLoading;

  const isLoggedIn = !!user;
  const isActive = subscription ? subscription.status === 'active' : true;

  const value = { user, subscription, loading, logout, refreshSubscription, lojaId, lojaLoading, login, signup, isLoggedIn, isActive };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
