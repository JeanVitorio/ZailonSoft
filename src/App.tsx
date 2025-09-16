import { useEffect } from 'react'; // Adicionado para o teste
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { supabase } from './supabaseClient'; // Adicionado para o teste

// Importe todas as suas páginas
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SubscribePage } from './pages/SubscribePage';
import HomePage from './pages/HomePage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// --- O "Teste de Fumaça" para verificar a conexão ---
const SmokeTest = () => {
  useEffect(() => {
    console.log("--- INICIANDO TESTE DE CONEXÃO COM SUPABASE ---");
    
    async function testConnection() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("--- TESTE FALHOU (ERRO NA RESPOSTA) ---", error);
        } else {
          console.log("--- TESTE BEM-SUCEDIDO! A CONEXÃO FUNCIONA. ---", data.session);
        }
      } catch (err) {
        console.error("--- TESTE FALHOU (ERRO GERAL DE CONEXÃO) ---", err);
      }
    }

    testConnection();
  }, []);

  return null; // Este componente não renderiza nada
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Adicionamos o teste aqui. Ele não afeta o visual do site. */}
        <SmokeTest />

        <AuthProvider>
          <Routes>
            {/* --- Rotas Públicas --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* --- Rota Única para Gerenciar Assinatura --- */}
            <Route path="/assinar" element={<SubscribePage />} />

            {/* --- Rota Protegida Principal --- */}
            <Route
              path="/sistema/*"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            {/* --- Rota para Página Não Encontrada --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;