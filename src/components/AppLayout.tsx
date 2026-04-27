import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 sm:pt-20">
          <Outlet />
        </div>
      </main>

      {/* Плавающая кнопка-триггер слева сверху, чтобы не конфликтовать с кнопками действий справа */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Открыть меню"
            className="fixed top-4 left-4 z-40 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-[280px] sm:max-w-[280px] border-l-2 border-border">
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppLayout;
