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
    // Локальный фолбэк по тестовым логинам
    const found = MOCK_USERS.find(u => u.UserLogin === login);
    if (found) {
      // В демо пароли не проверяем — любой пароль валиден для тестовых пользователей
      return found;
    }
    return null;
  },

  registerUser: async (data: { login: string; password: string; roleId: number; first_name?: string; second_name?: string; phone?: string }): Promise<User | null> => {
    const result = await apiPost<User>('/api/auth/register', data);
    if (result) return result;
    if (MOCK_USERS.some(u => u.UserLogin === data.login)) return null;
    const newUser: User = {
      PK_UserId: (MOCK_USERS.reduce((m, u) => Math.max(m, u.PK_UserId), 0) || 0) + 1,
      UserLogin: data.login, UserPassword: '', FK_RoleId: data.roleId,
      first_name: data.first_name, second_name: data.second_name, phone: data.phone,
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },
};
