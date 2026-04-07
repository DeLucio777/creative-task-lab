import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FilePlus, BarChart3, Image, LogOut, User,
  Users, GraduationCap, Baby, ClipboardList, Trophy, Route,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/models';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: AppRole[]; // какие роли видят пункт
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Каталог заданий', roles: ['admin', 'educator', 'parent'] },
  { to: '/editor/new', icon: FilePlus, label: 'Создать задание', roles: ['admin', 'educator'] },
  { to: '/children', icon: Baby, label: 'Дети', roles: ['admin', 'educator'] },
  { to: '/educators', icon: GraduationCap, label: 'Педагоги', roles: ['admin'] },
  { to: '/representatives', icon: Users, label: 'Представители', roles: ['admin'] },
  { to: '/assignments', icon: ClipboardList, label: 'Назначения', roles: ['admin', 'educator', 'parent'] },
  { to: '/progress', icon: Trophy, label: 'Прогресс', roles: ['admin', 'educator', 'parent'] },
  { to: '/trajectories', icon: Route, label: 'Траектории', roles: ['admin', 'educator'] },
  { to: '/media-library', icon: Image, label: 'Медиа-библиотека', roles: ['admin', 'educator'] },
  { to: '/reports', icon: BarChart3, label: 'Отчётность', roles: ['admin', 'educator'] },
  { to: '/profile', icon: User, label: 'Личный кабинет', roles: ['admin', 'educator', 'parent'] },
];

const AppSidebar: React.FC = () => {
  const { user, isGuest, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const visibleItems = navItems.filter(item => {
    if (isGuest) return item.to === '/dashboard';
    return item.roles.includes(role);
  });

  const roleLabel: Record<AppRole, string> = {
    admin: 'Администратор',
    educator: 'Педагог',
    parent: 'Представитель',
  };

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground">🧩 PECS Editor</h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {user?.UserLogin ?? 'Гость'} • {isGuest ? 'Гость' : roleLabel[role]}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
