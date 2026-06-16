import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FilePlus, BarChart3, Image, LogOut, User,
  GraduationCap, Baby, ClipboardList, Trophy, Home, UsersRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types/models';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  { to: '/home', icon: Home, label: 'Мои задания', roles: ['parent'] },
  { to: '/dashboard', icon: LayoutGrid, label: 'Каталог заданий', roles: ['admin', 'educator'] },
  { to: '/editor/new', icon: FilePlus, label: 'Создать задание', roles: ['admin', 'educator'] },
  { to: '/children', icon: Baby, label: 'Дети', roles: ['admin', 'educator'] },
  { to: '/groups', icon: UsersRound, label: 'Группы', roles: ['admin', 'educator'] },
  { to: '/educators', icon: GraduationCap, label: 'Педагоги', roles: ['admin'] },
  { to: '/assignments', icon: ClipboardList, label: 'Назначить цепочку', roles: ['educator'] },
  { to: '/progress', icon: Trophy, label: 'Прогресс', roles: ['admin', 'educator', 'parent'] },
  { to: '/media-library', icon: Image, label: 'Медиа-библиотека', roles: ['admin', 'educator'] },
  { to: '/reports', icon: BarChart3, label: 'Отчётность', roles: ['admin', 'educator'] },
  { to: '/profile', icon: User, label: 'Личный кабинет', roles: ['admin', 'educator', 'parent'] },
];

interface Props {
  collapsed?: boolean;
}

const AppSidebar: React.FC<Props> = ({ collapsed = false }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const visibleItems = navItems.filter(item => item.roles.includes(role));

  const roleLabel: Record<AppRole, string> = {
    admin: 'Администратор',
    educator: 'Педагог',
    parent: 'Представитель',
  };

  const displayName = user?.first_name || user?.second_name
    ? `${user?.second_name ?? ''} ${user?.first_name ?? ''}`.trim()
    : user?.UserLogin ?? '';

  return (
    <div className="h-full flex flex-col">
      <div className={`border-b border-border ${collapsed ? 'p-3' : 'p-6'}`}>
        {collapsed ? (
          <div className="text-2xl text-center" title={`${displayName} • ${roleLabel[role]}`}>🧩</div>
        ) : (
          <>
            <h2 className="text-xl font-bold tracking-tight text-foreground">🧩</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
              {displayName} • {roleLabel[role]}
            </p>
          </>
        )}
      </div>

      <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-4'}`}>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`border-t border-border ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Выйти' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all duration-200`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Выйти'}
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;
