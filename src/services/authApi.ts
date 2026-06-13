import type { User, Role } from '@/types/models';
import { apiGet, apiPost, safe, ApiError } from './apiClient';
import { toast } from 'sonner';

export interface LoginRequest { login: string; password: string }
export interface RegisterRequest {
  login: string;
  password: string;
  roleId: number;
  first_name?: string;
  second_name?: string;
  phone?: string;
  email?: string;
}

async function isLoginTaken(login: string): Promise<boolean> {
  const all = await safe(apiGet<User[]>('/api/users'), [] as User[]);
  const norm = login.trim().toLowerCase();
  return all.some(u => (u.UserLogin || '').toLowerCase() === norm);
}

export const authApi = {
  getRoles: (): Promise<Role[]> => safe(apiGet<Role[]>('/api/roles'), []),
  getUsers: (): Promise<User[]> => safe(apiGet<User[]>('/api/users'), []),
  isLoginTaken,
  login: (login: string, password: string): Promise<User | null> =>
    safe(apiPost<User>('/api/auth/login', { login, password } satisfies LoginRequest), null),

  /**
   * Универсальная регистрация. Бэк ожидает:
   *   { login, password, roleId, first_name, second_name, phone, email }
   * Сначала создаётся User, затем (на бэке) формируется доп. инфо в
   * tbl_childInfo либо tbl_teacherInfo в зависимости от роли.
   */
  registerUser: async (data: RegisterRequest): Promise<User | null> => {
    const login = data.login?.trim();
    if (!login) { toast.error('Логин обязателен'); return null; }
    if (!data.password || data.password.length < 4) {
      toast.error('Пароль должен быть не короче 4 символов');
      return null;
    }
    if (!data.roleId) { toast.error('Не указана роль'); return null; }
    if (await isLoginTaken(login)) {
      toast.error(`Логин «${login}» уже занят`);
      return null;
    }
    try {
      return await apiPost<User>('/api/auth/register', { ...data, login });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || /exists|занят|duplicate/i.test(e.message))) {
        toast.error(`Логин «${login}» уже занят`);
      } else {
        toast.error('Нет доступа к серверу');
      }
      return null;
    }
  },
};
