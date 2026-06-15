import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <aside
        className={`relative shrink-0 border-l-2 border-border bg-card transition-[width] duration-200 ease-out ${
          collapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          className="absolute -left-4 top-6 z-10 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-105 transition-transform"
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <AppSidebar collapsed={collapsed} />
      </aside>
    </div>
  );
};

export default AppLayout;
