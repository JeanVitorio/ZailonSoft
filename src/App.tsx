// App.tsx

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Páginas
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SubscribePage } from './pages/SubscribePage';
import HomePage from './pages/HomePage';
import LeadFlow from './pages/LeadFlow';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Rotas Públicas
import PublicCarFormPage from './pages/PublicCarFormPage';
import { PublicVehicleCatalogPage } from './pages/PublicVehicleCatalogPage';

// Nova rota — ativação de conta
import ActivateAccountPage from './pages/ActivateAccountPage';

// React-Query
const queryClient = new QueryClient();

// ============================
// APP PRINCIPAL
// ============================
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AuthProvider queryClient={queryClient}>
          {/* 
            Wrapper GLOBAL dark mode 
            Garante que NADA fica branco no fundo 
          */}
          <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
            <AnimatedRoutes />
          </div>

        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);



// ============================
// ROTAS COM ANIMAÇÃO
// ============================
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ROTAS PÚBLICAS */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/leadflow" element={<LeadFlow />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Página de erro de renovação */}
        <Route path="/assinar" element={<SubscribePage />} />

        {/* Nova página: ativação de conta */}
        <Route path="/ativar-conta" element={<ActivateAccountPage />} />

        {/* Páginas públicas sem login */}
        <Route path="/form-proposta/:carId" element={<PublicCarFormPage />} />
        <Route path="/catalogo-loja/:lojaId" element={<PublicVehicleCatalogPage />} />

        {/* ÁREA PROTEGIDA */}
        <Route
          path="/sistema/*"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </AnimatePresence>
  );
};

export default App;
