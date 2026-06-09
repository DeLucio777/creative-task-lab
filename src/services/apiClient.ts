import {toast} from 'sonner';

/**
 * Единый типизированный HTTP-клиент.
 * Реальные сетевые вызовы; никаких локальных фолбэков.
 * При недоступности сервера выбрасывает ApiError; обёртка safe() показывает
 * пользователю тост «Нет доступа к серверу» и возвращает указанный fallback.
 */

export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export class ApiError extends Error {
    constructor(public readonly status: number, public readonly path: string, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

let lastToastAt = 0;

function notifyServerDown(error: unknown): void {
    const now = Date.now();
    if (now - lastToastAt > 4000) {
        lastToastAt = now;
        toast.error('Нет доступа к серверу');
    }
    // eslint-disable-next-line no-console
    console.error('[API]', error);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!API_BASE) {
        throw new ApiError(0, path, 'VITE_API_BASE_URL не настроен');
    }
    let res: Response;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(init?.headers ?? {}),
            },
        });
    } catch (e) {
        throw new ApiError(0, path, e instanceof Error ? e.message : 'network error');
    }
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new ApiError(res.status, path, text || res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {method: 'POST', body: JSON.stringify(body ?? {})});
export const apiPut = <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {method: 'PUT', body: JSON.stringify(body ?? {})});
export const apiDelete = (path: string): Promise<void> =>
    request<void>(path, {method: 'DELETE'});

export async function apiUpload<T>(path: string, file: File, fields: Record<string, string>): Promise<T> {
    if (!API_BASE) throw new ApiError(0, path, 'VITE_API_BASE_URL не настроен');
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    let res: Response;
    try {
        res = await fetch(`${API_BASE}${path}`, {method: 'POST', body: fd});
    } catch (e) {
        throw new ApiError(0, path, e instanceof Error ? e.message : 'network error');
    }
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new ApiError(res.status, path, text || res.statusText);
    }
    return (await res.json()) as T;
}

/**
 * Безопасный вызов: при ошибке показывает тост и возвращает fallback.
 * Используется внутри сервис-модулей, чтобы UI не падал при недоступности API.
 */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
    try {
        return await p;
    } catch (e) {
        notifyServerDown(e);
        return fallback;
    }
}
