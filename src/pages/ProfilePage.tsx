import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_ROLES } from '@/data/mockData';

const ProfilePage: React.FC = () => {
  const { user, isGuest } = useAuth();
  const role = MOCK_ROLES.find(r => r.PK_RoleId === user?.FK_RoleId);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">👤 Личный кабинет</h1>
      <div className="bg-card rounded-2xl border-2 border-border p-6 space-y-5">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Логин</p>
          <p className="text-foreground font-bold text-lg">{user?.UserLogin}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Роль</p>
          <p className="text-foreground font-bold text-lg">{role?.RoleName ?? `ID роли: ${user?.FK_RoleId}`}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
