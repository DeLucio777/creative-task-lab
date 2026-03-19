import type {
  Task, TaskTemplate, CatalogPECS, MediaCatalog,
  User, Role, FindOddOneOutItem, MatchImageWordPair,
  SequenceItem, SortItem
} from '@/types/models';
import {
  MOCK_TASKS, MOCK_TEMPLATES, MOCK_PECS, MOCK_MEDIA,
  MOCK_USERS, MOCK_ROLES
} from '@/data/mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<T> {
  if (!API_BASE) return fallback;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || (Array.isArray(data) && data.length === 0)) return fallback;
    return data as T;
  } catch {
    console.warn(`API ${endpoint} unavailable, using mock data`);
    return fallback;
  }
}

// GET
export const api = {
  getRoles: () => fetchWithFallback<Role[]>('/api/roles', MOCK_ROLES),
  getUsers: () => fetchWithFallback<User[]>('/api/users', MOCK_USERS),
  getTasks: () => fetchWithFallback<Task[]>('/api/tasks', MOCK_TASKS),
  getTask: (id: number) => fetchWithFallback<Task | null>(`/api/tasks/${id}`, MOCK_TASKS.find(t => t.PK_TaskId === id) || null),
  getTemplates: () => fetchWithFallback<TaskTemplate[]>('/api/templates', MOCK_TEMPLATES),
  getPecs: () => fetchWithFallback<CatalogPECS[]>('/api/pecs', MOCK_PECS),
  getMedia: () => fetchWithFallback<MediaCatalog[]>('/api/media', MOCK_MEDIA),

  getTaskFindOddItems: (taskId: number) => fetchWithFallback<FindOddOneOutItem[]>(`/api/tasks/${taskId}/find-odd-items`, []),
  getTaskMatchPairs: (taskId: number) => fetchWithFallback<MatchImageWordPair[]>(`/api/tasks/${taskId}/match-pairs`, []),
  getTaskSequenceItems: (taskId: number) => fetchWithFallback<SequenceItem[]>(`/api/tasks/${taskId}/sequence-items`, []),
  getTaskSortItems: (taskId: number) => fetchWithFallback<SortItem[]>(`/api/tasks/${taskId}/sort-items`, []),

  // POST
  login: async (login: string, password: string): Promise<User | null> => {
    if (!API_BASE) {
      return MOCK_USERS.find(u => u.UserLogin === login && u.UserPassword === password) || null;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return MOCK_USERS.find(u => u.UserLogin === login && u.UserPassword === password) || null;
    }
  },

  createTask: async (task: Partial<Task>): Promise<Task | null> => {
    if (!API_BASE) {
      const newTask: Task = {
        PK_TaskId: Date.now(),
        Title: task.Title || '',
        FK_TemplateId: task.FK_TemplateId || 1,
        FK_UserId: task.FK_UserId || 1,
        Descripti: task.Descripti,
        DifficultyLevel: task.DifficultyLevel,
      };
      MOCK_TASKS.push(newTask);
      return newTask;
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },

  uploadPecs: async (file: File, description: string, category: string): Promise<CatalogPECS | null> => {
    if (!API_BASE) {
      const url = URL.createObjectURL(file);
      const newPecs: CatalogPECS = {
        PK_PECSid: Date.now(),
        Descripti: description,
        filePath: url,
        Category: category,
        UploadDate: new Date().toISOString(),
      };
      MOCK_PECS.push(newPecs);
      return newPecs;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', description);
      fd.append('category', category);
      const res = await fetch(`${API_BASE}/api/pecs`, { method: 'POST', body: fd });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },

  uploadMedia: async (file: File, description: string): Promise<MediaCatalog | null> => {
    if (!API_BASE) {
      const url = URL.createObjectURL(file);
      const newMedia: MediaCatalog = {
        PK_MediaId: Date.now(),
        FileType: file.type,
        FilePath: url,
        Descripti: description,
        UploadDate: new Date().toISOString(),
      };
      MOCK_MEDIA.push(newMedia);
      return newMedia;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', description);
      const res = await fetch(`${API_BASE}/api/media`, { method: 'POST', body: fd });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};
