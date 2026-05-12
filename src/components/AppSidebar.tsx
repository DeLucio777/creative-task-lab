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
  // Родитель/ребёнок — главная
  { to: '/home', icon: Home, label: 'Мои задания', roles: ['parent'] },

  // Каталог — только педагог/админ
  { to: '/dashboard', icon: LayoutGrid, label: 'Каталог заданий', roles: ['admin', 'educator'] },
  { to: '/editor/new', icon: FilePlus, label: 'Создать задание', roles: ['admin', 'educator'] },

  // Управление учениками
  { to: '/children', icon: Baby, label: 'Дети', roles: ['admin', 'educator'] },
  { to: '/groups', icon: UsersRound, label: 'Группы', roles: ['admin', 'educator'] },
  { to: '/educators', icon: GraduationCap, label: 'Педагоги', roles: ['admin'] },

  // Цепочки/назначения — только педагог (у админа скрыто)
  { to: '/assignments', icon: ClipboardList, label: 'Назначить цепочку', roles: ['educator'] },
  { to: '/progress', icon: Trophy, label: 'Прогресс', roles: ['admin', 'educator', 'parent'] },

  // Медиа и отчёты
  { to: '/media-library', icon: Image, label: 'Медиа-библиотека', roles: ['admin', 'educator'] },
  { to: '/reports', icon: BarChart3, label: 'Отчётность', roles: ['admin', 'educator'] },

  // Профиль — у всех
  { to: '/profile', icon: User, label: 'Личный кабинет', roles: ['admin', 'educator', 'parent'] },
];

interface Props {
  onNavigate?: () => void;
}

const AppSidebar: React.FC<Props> = ({ onNavigate }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); onNavigate?.(); navigate('/'); };

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
    <aside className="w-full h-full bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground">🧩 PECS Editor</h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {displayName} • {roleLabel[role]}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
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
