import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import TasksRoute from "./pages/TasksRoute";
import NewTaskRoute from "./pages/NewTaskRoute";
import DashboardRoute from "./pages/DashboardRoute";
import ProfileRoute from "./pages/ProfileRoute";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-bold animate-pulse">Carregando Zailon...</p>
      </div>
    );
  }

  // Show auth page only when Supabase is configured but user is not logged in
  if (isConfigured && !user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/tasks" element={<TasksRoute />} />
      <Route path="/new-task" element={<NewTaskRoute />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/profile" element={<ProfileRoute />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
