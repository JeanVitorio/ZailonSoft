// src/App.tsx

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
import { SubscribePage } from './pages/SubscribePage'; // Rota para quem precisa assinar
import { RegularizePaymentPage } from './pages/RegularizePaymentPage'; // Rota para quem tem pagamento pendente
import HomePage from './pages/HomePage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Rotas de Gerenciamento de Assinatura */}
            <Route path="/assinar" element={<SubscribePage />} />
            <Route path="/regularizar-pagamento" element={<RegularizePaymentPage />} />

            {/* Rota Protegida Principal */}
            <Route
              path="/sistema/*" // O "/*" permite rotas aninhadas dentro do seu painel principal (Index)
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            {/* Rota para páginas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;