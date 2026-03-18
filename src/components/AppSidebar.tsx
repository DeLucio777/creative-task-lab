import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, FilePlus, BarChart3, Image, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  guestHidden?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Каталог' },
  { to: '/editor/new', icon: FilePlus, label: 'Создать задание', guestHidden: true },
  { to: '/reports', icon: BarChart3, label: 'Отчётность' },
  { to: '/profile', icon: User, label: 'Личный кабинет', guestHidden: true },
  { to: '/media-library', icon: Image, label: 'Библиотека медиа', guestHidden: true },
];

const AppSidebar: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const visibleItems = navItems.filter(item => !(item.guestHidden && isGuest));

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight text-foreground">🧩 PECS Editor</h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{user?.UserLogin ?? 'Гость'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
