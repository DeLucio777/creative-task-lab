import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import UserBackground from '@/components/UserBackground';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 64;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <UserBackground />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <aside
        className="relative shrink-0 h-screen sticky top-0 border-l-2 border-border bg-card transition-[width] duration-200 ease-out"
        style={{ width }}
      >
        <AppSidebar collapsed={collapsed} />
      </aside>

      {/* Кнопка вынесена в fixed-слой над всем — никакой overflow её не обрежет */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        className="fixed top-6 z-[60] h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background flex items-center justify-center hover:scale-105 transition-all"
        style={{ right: width - 18 }}
      >
        {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default AppLayout;
