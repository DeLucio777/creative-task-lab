import type { User, Role } from '@/types/models';
import { apiFetch, apiPost, API_BASE } from './apiClient';
import { MOCK_ROLES, MOCK_USERS } from '@/data/mockData';

export const authApi = {
  getRoles: () => apiFetch<Role[]>('/api/roles', MOCK_ROLES),
  getUsers: () => apiFetch<User[]>('/api/users', MOCK_USERS),

  login: async (login: string, password: string): Promise<User | null> => {
    if (API_BASE) {
      const result = await apiPost<User>('/api/auth/login', { login, password });
      if (result) return result;
    }
    // Local fallback
    if (login === 'admin' && password === 'admin123') {
      return { PK_UserId: 1, UserLogin: 'admin', UserPassword: '', FK_RoleId: 1 };
    }
    if (login === 'educator' && password === 'edu123') {
      return { PK_UserId: 2, UserLogin: 'educator', UserPassword: '', FK_RoleId: 2 };
    }
    if (login === 'parent' && password === 'parent123') {
      return { PK_UserId: 3, UserLogin: 'parent', UserPassword: '', FK_RoleId: 3 };
    }
    return null;
  },

  registerUser: async (data: { login: string; password: string; roleId: number }): Promise<User | null> => {
    const result = await apiPost<User>('/api/auth/register', data);
    if (result) return result;
    // Local fallback
    const newUser: User = {
      PK_UserId: Date.now(),
      UserLogin: data.login,
      UserPassword: '',
      FK_RoleId: data.roleId,
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },
};
