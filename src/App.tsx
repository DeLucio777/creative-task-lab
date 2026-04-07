import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/types/models";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import TaskEditorPage from "@/pages/TaskEditorPage";
import MediaLibraryPage from "@/pages/MediaLibraryPage";
import ProfilePage from "@/pages/ProfilePage";
import ReportsPage from "@/pages/ReportsPage";
import ChildrenPage from "@/pages/ChildrenPage";
import EducatorsPage from "@/pages/EducatorsPage";
import RepresentativesPage from "@/pages/RepresentativesPage";
import AssignmentsPage from "@/pages/AssignmentsPage";
import ProgressPage from "@/pages/ProgressPage";
import TrajectoriesPage from "@/pages/TrajectoriesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleGuard = ({ children, allowed }: { children: React.ReactNode; allowed: AppRole[] }) => {
  const { role, isGuest } = useAuth();
  if (isGuest || !allowed.includes(role)) return <Navigate to="/dashboard" replace />;
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
        <Route path="/editor/:id" element={<RoleGuard allowed={['admin', 'educator']}><TaskEditorPage /></RoleGuard>} />
        <Route path="/children" element={<RoleGuard allowed={['admin', 'educator']}><ChildrenPage /></RoleGuard>} />
        <Route path="/educators" element={<RoleGuard allowed={['admin']}><EducatorsPage /></RoleGuard>} />
        <Route path="/representatives" element={<RoleGuard allowed={['admin']}><RepresentativesPage /></RoleGuard>} />
        <Route path="/assignments" element={<RoleGuard allowed={['admin', 'educator', 'parent']}><AssignmentsPage /></RoleGuard>} />
        <Route path="/progress" element={<RoleGuard allowed={['admin', 'educator', 'parent']}><ProgressPage /></RoleGuard>} />
        <Route path="/trajectories" element={<RoleGuard allowed={['admin', 'educator']}><TrajectoriesPage /></RoleGuard>} />
        <Route path="/media-library" element={<RoleGuard allowed={['admin', 'educator']}><MediaLibraryPage /></RoleGuard>} />
        <Route path="/profile" element={<RoleGuard allowed={['admin', 'educator', 'parent']}><ProfilePage /></RoleGuard>} />
        <Route path="/reports" element={<RoleGuard allowed={['admin', 'educator']}><ReportsPage /></RoleGuard>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
