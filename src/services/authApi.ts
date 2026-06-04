import type { User, Role } from '@/types/models';
import { apiGet, apiPost, safe } from './apiClient';

export interface LoginRequest { login: string; password: string }
export interface RegisterRequest {
  login: string;
  password: string;
  roleId: number;
  first_name?: string;
  second_name?: string;
  phone?: string;
}

export const authApi = {
  getRoles: (): Promise<Role[]> => safe(apiGet<Role[]>('/api/roles'), []),
  getUsers: (): Promise<User[]> => safe(apiGet<User[]>('/api/users'), []),
  login: (login: string, password: string): Promise<User | null> =>
    safe(apiPost<User>('/api/auth/login', { login, password } satisfies LoginRequest), null),
  registerUser: (data: RegisterRequest): Promise<User | null> =>
    safe(apiPost<User>('/api/auth/register', data), null),
};
