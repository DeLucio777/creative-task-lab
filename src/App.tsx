import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import TaskEditorPage from "@/pages/TaskEditorPage";
import MediaLibraryPage from "@/pages/MediaLibraryPage";
import ProfilePage from "@/pages/ProfilePage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AuthenticatedOnly = ({ children }: { children: React.ReactNode }) => {
  const { isGuest } = useAuth();
  if (isGuest) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/task/:id" element={<TaskDetailPage />} />
        <Route path="/editor/:id" element={<AuthenticatedOnly><TaskEditorPage /></AuthenticatedOnly>} />
        <Route path="/media-library" element={<AuthenticatedOnly><MediaLibraryPage /></AuthenticatedOnly>} />
        <Route path="/profile" element={<AuthenticatedOnly><ProfilePage /></AuthenticatedOnly>} />
        <Route path="/reports" element={<AuthenticatedOnly><ReportsPage /></AuthenticatedOnly>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
