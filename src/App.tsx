import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

// Public Pages
import Index from "./pages/Index";
import VehicleDetail from "./pages/VehicleDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import MainLayout from "./components/admin/MainLayout";
import Dashboard from "./pages/admin/Dashboard";
import VehicleCatalog from "./pages/admin/VehicleCatalog";
import CRMKanban from "./pages/admin/CRMKanban";
import AddVehicle from "./pages/admin/AddVehicle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/veiculo/:id" element={<VehicleDetail />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin Routes */}
              <Route path="/sistema" element={<MainLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="catalogo" element={<VehicleCatalog />} />
                <Route path="crm" element={<CRMKanban />} />
                <Route path="adicionar" element={<AddVehicle />} />
                <Route path="configuracoes" element={<Dashboard />} />
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
