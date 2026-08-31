import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { fetchLojaBySlug } from "@/services/api";
import React from "react";

// Public Pages
import DemoPage from "./pages/DemoPage";
import PublicCatalog from "./pages/PublicCatalog";
import PublicVehicleDetail from "./pages/PublicVehicleDetail";
import LoginPage from "./pages/LoginPage";
import SubscribePage from "./pages/SubscribePage";
import PastDuePage from "./pages/PastDuePage";
import NotFound from "./pages/NotFound";
import AdminMaster from "./pages/AdminMaster";
import DomainUnavailable from "./pages/DomainUnavailable";

// Admin Pages
import MainLayout from "./components/admin/MainLayout";
import Dashboard from "./pages/admin/Dashboard";
import VehicleCatalog from "./pages/admin/VehicleCatalog";
import CRMKanban from "./pages/admin/CRMKanban";
import AddVehicle from "./pages/admin/AddVehicle";
import StoreSettings from "./pages/admin/StoreSettings";
import Vendedores from "./pages/admin/Vendedores";

const queryClient = new QueryClient();

const SistemaRedirect = () => {
  const { lojaSlug, lojaInfo, loading, isLoggedIn } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (lojaInfo?.dominio) {
    window.location.replace(`https://${lojaInfo.dominio}/admin/dashboard`);
    return null;
  }
  if (lojaSlug) return <Navigate to={`/${lojaSlug}/dashboard`} replace />;
  return <Navigate to="/login" replace />;
};

const LegacyDomainGate = () => {
  const { lojaSlug } = useParams<{ lojaSlug: string }>();
  const location = useLocation();
  const [ready, setReady] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!lojaSlug) return;
    let active = true;
    fetchLojaBySlug(lojaSlug)
      .then((loja) => {
        if (!active) return;
        if (loja.dominio) {
          const legacyBase = `/${lojaSlug}`;
          const suffix = location.pathname.slice(legacyBase.length) || '/dashboard';
          window.location.replace(`https://${loja.dominio}/admin${suffix}`);
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [location.pathname, lojaSlug]);

  if (notFound) return <NotFound />;
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <Outlet />;
};

const AdminChildren = () => (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="catalogo" element={<VehicleCatalog />} />
    <Route path="crm" element={<CRMKanban />} />
    <Route path="vendedores" element={<Vendedores />} />
    <Route path="adicionar" element={<AddVehicle />} />
    <Route path="configuracoes" element={<StoreSettings />} />
  </>
);

const AppRoutes = () => {
  const { loading, error, isPlatformHost } = useTenant();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error && (!isPlatformHost || location.pathname === '/')) {
    return <DomainUnavailable message={error} />;
  }

  if (!isPlatformHost) {
    return (
      <Routes>
        <Route path="/" element={<PublicCatalog />} />
        <Route path="/veiculo/:id" element={<PublicVehicleDetail />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/assinar" element={<SubscribePage />} />
        <Route path="/admin/inadimplente" element={<PastDuePage />} />
        <Route path="/admin" element={<MainLayout />}>
          {AdminChildren()}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PublicCatalog />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/assinar" element={<SubscribePage />} />
      <Route path="/inadimplente" element={<PastDuePage />} />
      <Route path="/loja/:lojaSlug" element={<PublicCatalog />} />
      <Route path="/loja/:lojaSlug/veiculo/:id" element={<PublicVehicleDetail />} />
      <Route path="/sistema" element={<SistemaRedirect />} />
      <Route path="/sistema/*" element={<SistemaRedirect />} />

      {/* Super Admin (rota oculta — somente owners autorizados) */}
      <Route path="/admin-master" element={<AdminMaster />} />
      <Route path="/admin-master/:section" element={<AdminMaster />} />

      <Route path="/:lojaSlug" element={<LegacyDomainGate />}>
        <Route element={<MainLayout />}>
          {AdminChildren()}
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <TenantProvider>
          <AuthProvider queryClient={queryClient}>
            <DataProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </DataProvider>
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
