import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

// --- Interfaces ---
interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | 'unpaid' | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean; // <- Loading combinado (Auth + Subscrição + Loja)
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  
  // 🚨 NOVAS PROPRIEDADES PARA ISOLAMENTO DE DADOS
  lojaId: string | null; 
  lojaLoading: boolean;
  login?: (email: string, password: string) => Promise<boolean>;
  signup?: (email: string, password: string, meta?: Record<string, any>) => Promise<boolean>;
  isLoggedIn?: boolean;
  isActive?: boolean;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children, queryClient }: { children: ReactNode; queryClient?: QueryClient }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [authLoading, setAuthLoading] = useState(true); 
  const [subLoading, setSubLoading] = useState(true); 
  
  // 🚨 NOVO ESTADO DA LOJA
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [lojaLoading, setLojaLoading] = useState(true);

  // Função para carregar ou refrescar a assinatura (MANTIDA)
  const loadSubscription = async (currentUserId: string | undefined) => {
    if (currentUserId) {
      setSubLoading(true); 
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (subError) {
        console.error("Erro ao carregar assinatura:", subError.message);
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
  
  // 🚨 NOVA FUNÇÃO PARA CARREGAR O ID DA LOJA
  const loadLojaId = async (currentUserId: string | undefined) => {
    if (currentUserId) {
      setLojaLoading(true);
      const { data: lojaData, error: lojaError } = await supabase
        .from('lojas')
        .select('id')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (lojaError) {
        console.error("Erro ao carregar loja:", lojaError.message);
        setLojaId(null);
      } else {
        // O ID da loja é o campo 'id' da tabela 'lojas'
        setLojaId(lojaData?.id ?? null);
      }
      setLojaLoading(false);
    } else {
      setLojaId(null);
      setLojaLoading(false); 
    }
  };


  useEffect(() => {
    // 1. Verificação inicial da sessão
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      
      setUser(currentUser);
      setAuthLoading(false); 
      
      // 🚨 Carrega as dependências
      const loadPromises = [
        loadSubscription(currentUser?.id),
        loadLojaId(currentUser?.id), // Carrega o lojaId
      ];
      await Promise.all(loadPromises);
    };

    checkSession();

    // 2. Listener para mudanças de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false); 
      
      // 🚨 Recarrega as dependências no login/logout
      loadSubscription(currentUser?.id); 
      loadLojaId(currentUser?.id); 
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // Função pública para refrescar (MANTIDA)
  const refreshSubscription = async () => {
    await loadSubscription(user?.id);
  };

  // A função de logout "Zero Cache" (MANTIDA)
  const logout = async () => {
    console.log("Iniciando logout completo e limpeza de caches...");
    await supabase.auth.signOut();
    if (queryClient) queryClient.clear();
    setUser(null);
    setSubscription(null);
    setLojaId(null); // Limpa o ID da loja no logout
    window.location.href = '/login';
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
  const loading = authLoading || subLoading || lojaLoading; 

  const isLoggedIn = !!user;
  const isActive = subscription ? subscription.status === 'active' : true;

  // 🚨 NOVO OBJETO DE VALOR (atualizado com login, signup, isLoggedIn, isActive)
  const value = { user, subscription, loading, logout, refreshSubscription, lojaId, lojaLoading, login, signup, isLoggedIn, isActive };
}

// --- Hook de Acesso (MANTIDO) ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
