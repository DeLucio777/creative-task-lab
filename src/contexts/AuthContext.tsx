import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types/models';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = async (username: string, password: string) => {
    const found = await api.login(username, password);
    if (found) {
      setUser(found);
      setIsGuest(false);
      return true;
    }
    return false;
  };

  const loginAsGuest = () => {
    setUser({ PK_UserId: 0, UserLogin: 'Гость', UserPassword: '', FK_RoleId: 3 });
    setIsGuest(true);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
