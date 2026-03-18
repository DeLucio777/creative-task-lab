import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, FilePlus, BarChart3, Image, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Каталог' },
  { to: '/editor/new', icon: FilePlus, label: 'Создать задание' },
  { to: '/reports', icon: BarChart3, label: 'Отчётность' },
  { to: '/profile', icon: User, label: 'Личный кабинет' },
  { to: '/media-library', icon: Image, label: 'Библиотека медиа' },
];

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">PECS Editor</h2>
        <p className="text-xs text-muted-foreground mt-1">{user?.UserLogin ?? 'Гость'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
