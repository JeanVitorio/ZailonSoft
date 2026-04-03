import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
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
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center animate-pulse">
            <span className="text-3xl font-black text-primary-foreground">Z</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
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
      <Route path="/goals/edit/:id" element={<EditGoalPage />} />
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
