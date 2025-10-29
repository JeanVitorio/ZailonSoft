import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// --- 1. Importações necessárias ---
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // <-- IMPORTADO

import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Importe todas as suas páginas
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SubscribePage } from './pages/SubscribePage';
import HomePage from './pages/HomePage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// NOVAS ROTAS PÚBLICAS
import PublicCarFormPage from './pages/PublicCarFormPage'; 
import { PublicVehicleCatalogPage } from './pages/PublicVehicleCatalogPage';

// --- [NOVA IMPORTAÇÃO AQUI] ---
import ActivateAccountPage from './pages/ActivateAccountPage'; 

// Criamos o queryClient aqui
const queryClient = new QueryClient();

// --- 2. O componente App agora só gerencia os Providers ---
//    Ele renderiza o <BrowserRouter> e DELEGA as rotas
//    para o novo componente <AnimatedRoutes />
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider queryClient={queryClient}>
          {/* O novo componente vai aqui */}
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// --- 3. Este é o NOVO componente que gerencia as animações de rota ---
const AnimatedRoutes = () => {
  // 4. Pegamos a localização atual (isso funciona
  //    porque estamos DENTRO do <BrowserRouter> agora)
  const location = useLocation();

  return (
    // 5. O AnimatePresence envolve as rotas
    <AnimatePresence mode="wait">
      {/* 6. Passamos a 'location' e uma 'key' para o <Routes>
             Isso "avisa" o AnimatePresence quando a página muda. */}
      <Routes location={location} key={location.pathname}>
        
        {/* --- Rotas Públicas --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Rota para Gerenciar Assinatura (falha na renovação) */}
        <Route path="/assinar" element={<SubscribePage />} />

        {/* --- [NOVA ROTA AQUI] --- */}
        {/* Rota para Novo Pagamento (primeira vez) */}
        <Route path="/ativar-conta" element={<ActivateAccountPage />} />

        {/* NOVAS ROTAS PÚBLICAS SEM LOGIN NECESSÁRIO */}
        <Route path="/form-proposta/:carId" element={<PublicCarFormPage />} /> 
        <Route path="/catalogo-loja/:lojaId" element={<PublicVehicleCatalogPage />} />

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
    </AnimatePresence>
  );
};

export default App;