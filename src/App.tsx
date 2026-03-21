import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

// Public Pages
import Index from "./pages/Index";
import VehicleDetail from "./pages/VehicleDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SubscribePage from "./pages/SubscribePage";
import NotFound from "./pages/NotFound";

// Admin Pages
import MainLayout from "./components/admin/MainLayout";
import Dashboard from "./pages/admin/Dashboard";
import VehicleCatalog from "./pages/admin/VehicleCatalog";
import CRMKanban from "./pages/admin/CRMKanban";
import AddVehicle from "./pages/admin/AddVehicle";
import StoreSettings from "./pages/admin/StoreSettings";

const queryClient = new QueryClient();

// Redirect /sistema/* to /:lojaSlug/* for logged-in users
const SistemaRedirect = () => {
  const { lojaSlug, loading, isLoggedIn } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (lojaSlug) return <Navigate to={`/${lojaSlug}/dashboard`} replace />;
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider queryClient={queryClient}>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<Index />} />
              <Route path="/veiculo/:id" element={<VehicleDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/assinar" element={<SubscribePage />} />

              {/* Legacy /sistema redirect */}
              <Route path="/sistema" element={<SistemaRedirect />} />
              <Route path="/sistema/*" element={<SistemaRedirect />} />

              {/* Admin Routes - slug-based */}
              <Route path="/:lojaSlug" element={<MainLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="catalogo" element={<VehicleCatalog />} />
                <Route path="crm" element={<CRMKanban />} />
                <Route path="adicionar" element={<AddVehicle />} />
                <Route path="configuracoes" element={<StoreSettings />} />
                <Route path="ajuda" element={<Dashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
