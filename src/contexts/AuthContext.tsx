import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | 'unpaid' | null;
}

interface LojaInfo {
  id: string;
  slug: string;
  nome: string;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  lojaId: string | null;
  lojaSlug: string | null;
  lojaInfo: LojaInfo | null;
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
  const [lojaInfo, setLojaInfo] = useState<LojaInfo | null>(null);
  const [lojaLoading, setLojaLoading] = useState(true);

  const loadSubscription = async (currentUserId: string | undefined) => {
    if (!currentUserId) {
      setSubscription(null);
      setSubLoading(false);
      return;
    }

    setSubLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as Subscription | null);

      if (!data) {
        console.warn(`Nenhuma assinatura encontrada para user_id: ${currentUserId}`);
      }
    } catch (err: any) {
      console.error('Erro ao carregar assinatura:', err.message);
      setSubscription(null);
    } finally {
      setSubLoading(false);
    }
  };

  const loadLojaInfo = async (currentUserId: string | undefined) => {
    if (!currentUserId) {
      setLojaInfo(null);
      setLojaLoading(false);
      return;
    }

    setLojaLoading(true);
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('id, slug, nome, logo_url')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      setLojaInfo(data as LojaInfo | null);
    } catch (err: any) {
      console.error('Erro ao carregar loja:', err.message);
      setLojaInfo(null);
    } finally {
      setLojaLoading(false);
    }
  };

  useEffect(() => {
    const storedSession = localStorage.getItem('autoconnect_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.user) {
          setUser(parsed.user);
        }
      } catch (e) {
        console.error('Erro ao parsear sessão armazenada:', e);
      }
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        localStorage.setItem('autoconnect_session', JSON.stringify({ user: currentUser }));
        await Promise.all([
          loadSubscription(currentUser.id),
          loadLojaInfo(currentUser.id),
        ]);
      } else {
        setSubscription(null);
        setLojaInfo(null);
        setSubLoading(false);
        setLojaLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        localStorage.setItem('autoconnect_session', JSON.stringify({ user: currentUser }));
        loadSubscription(currentUser.id);
        loadLojaInfo(currentUser.id);
      } else {
        localStorage.removeItem('autoconnect_session');
        setSubscription(null);
        setLojaInfo(null);
        setSubLoading(false);
        setLojaLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshSubscription = async () => {
    if (user?.id) {
      await loadSubscription(user.id);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Erro no login:', error.message);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    await refreshSubscription();

    return true;
  };

  const signup = async (email: string, password: string, meta: Record<string, any> = {}): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: meta }
    });

    if (error) {
      console.error('Erro no signup:', error.message);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    if (data.user?.id) {
      await loadSubscription(data.user.id);
      await loadLojaInfo(data.user.id);
    }

    return !!data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    if (queryClient) queryClient.clear();
    localStorage.removeItem('autoconnect_session');
    setUser(null);
    setSubscription(null);
    setLojaInfo(null);
    window.location.href = '/login';
  };

  const loading = authLoading || subLoading || lojaLoading;

  const isLoggedIn = !!user;
  const isActive = loading 
    ? false 
    : subscription?.status === 'active' || false;

  const value = {
    user,
    subscription,
    loading,
    logout,
    refreshSubscription,
    lojaId: lojaInfo?.id ?? null,
    lojaSlug: lojaInfo?.slug ?? null,
    lojaInfo,
    lojaLoading,
    login,
    signup,
    isLoggedIn,
    isActive,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
