import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Importe todas as suas páginas
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SubscribePage } from './pages/SubscribePage';
import HomePage from './pages/HomePage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Criamos o queryClient aqui
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Passamos o queryClient para o AuthProvider */}
        <AuthProvider queryClient={queryClient}>
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