const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch<T>(endpoint: string, fallback: T): Promise<T> {
  if (!API_BASE) return fallback;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    console.warn(`API ${endpoint} unavailable, using local data`);
    return fallback;
  }
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    console.warn(`API POST ${endpoint} unavailable`);
    return null;
  }
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    console.warn(`API PUT ${endpoint} unavailable`);
    return null;
  }
}

export async function apiDelete(endpoint: string): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    console.warn(`API DELETE ${endpoint} unavailable`);
    return false;
  }
}

export async function apiUpload<T>(endpoint: string, file: File, fields: Record<string, string>): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    console.warn(`API upload ${endpoint} unavailable`);
    return null;
  }
}

export { API_BASE };
