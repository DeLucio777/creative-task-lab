import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, isGuest } = useAuth();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Личный кабинет</h1>
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Логин</p>
          <p className="text-foreground font-medium">{user?.UserLogin}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Роль</p>
          <p className="text-foreground font-medium">{isGuest ? 'Гость' : `ID роли: ${user?.FK_RoleId}`}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
