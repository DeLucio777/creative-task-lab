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
import ChildHomePage from "@/pages/ChildHomePage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import TaskEditorPage from "@/pages/TaskEditorPage";
import MediaLibraryPage from "@/pages/MediaLibraryPage";
import ProfilePage from "@/pages/ProfilePage";
import ReportsPage from "@/pages/ReportsPage";
import ChildrenPage from "@/pages/ChildrenPage";
import EducatorsPage from "@/pages/EducatorsPage";
import GroupsPage from "@/pages/GroupsPage";
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
  if (isGuest) return <Navigate to="/home" replace />;
  if (!allowed.includes(role)) {
    // Перенаправляем по роли на её домашнюю страницу
    return <Navigate to={role === 'parent' ? '/home' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

const RoleHome = () => {
  const { role } = useAuth();
  return <Navigate to={role === 'parent' ? '/home' : '/dashboard'} replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <RoleHome /> : <LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Каталог — только админ и педагог */}
        <Route path="/dashboard" element={<RoleGuard allowed={['admin', 'educator']}><DashboardPage /></RoleGuard>} />
        {/* Главная ребёнка/представителя — дашборд «сегодня» */}
        <Route path="/home" element={<ChildHomePage />} />
        {/* Прохождение задания доступно всем авторизованным */}
        <Route path="/task/:id" element={<TaskDetailPage />} />
        {/* Редактор — только админ/педагог */}
        <Route path="/editor/:id" element={<RoleGuard allowed={['admin', 'educator']}><TaskEditorPage /></RoleGuard>} />
        {/* Дети — админ/педагог */}
        <Route path="/children" element={<RoleGuard allowed={['admin', 'educator']}><ChildrenPage /></RoleGuard>} />
        {/* Педагоги — только админ */}
        <Route path="/educators" element={<RoleGuard allowed={['admin']}><EducatorsPage /></RoleGuard>} />
        {/* Группы — педагог/админ */}
        <Route path="/groups" element={<RoleGuard allowed={['admin', 'educator']}><GroupsPage /></RoleGuard>} />
        {/* Назначения цепочек — педагог/админ */}
        <Route path="/assignments" element={<RoleGuard allowed={['admin', 'educator']}><AssignmentsPage /></RoleGuard>} />
        {/* Прогресс — все авторизованные */}
        <Route path="/progress" element={<ProgressPage />} />
        {/* Траектории — педагог/админ */}
        <Route path="/trajectories" element={<RoleGuard allowed={['admin', 'educator']}><TrajectoriesPage /></RoleGuard>} />
        {/* Медиа-библиотека — педагог/админ */}
        <Route path="/media-library" element={<RoleGuard allowed={['admin', 'educator']}><MediaLibraryPage /></RoleGuard>} />
        {/* Профиль — все */}
        <Route path="/profile" element={<ProfilePage />} />
        {/* Отчёты — педагог/админ */}
        <Route path="/reports" element={<RoleGuard allowed={['admin', 'educator']}><ReportsPage /></RoleGuard>} />
        {/* Старые ссылки */}
        <Route path="/representatives" element={<Navigate to="/children" replace />} />
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
