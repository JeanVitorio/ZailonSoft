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
import EditTaskPage from "./pages/EditTaskPage";
import ProfileRoute from "./pages/ProfileRoute";
import QuestsRoute from "./pages/QuestsRoute";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import PublicProfilePage from "./pages/PublicProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CreateGoalPage from "./pages/CreateGoalPage";
import QuestTemplatesPage from "./pages/QuestTemplatesPage";
import EditGoalPage from "./pages/EditGoalPage";

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

  if (isConfigured && !user) {
    return (
      <Routes>
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/tasks" element={<TasksRoute />} />
      <Route path="/new-task" element={<NewTaskRoute />} />
      <Route path="/quests" element={<QuestsRoute />} />
      <Route path="/quests/new" element={<CreateGoalPage />} />
      <Route path="/quests/templates" element={<QuestTemplatesPage />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/tasks/edit/:id" element={<EditTaskPage />} />
      <Route path="/profile" element={<ProfileRoute />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/u/:username" element={<PublicProfilePage />} />
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
