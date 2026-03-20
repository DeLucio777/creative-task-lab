import type {
  Task, TaskTemplate, CatalogPECS, MediaCatalog,
  User, Role, FindOddOneOutItem, MatchImageWordPair,
  SequenceItem, SortItem, TaskConstruction
} from '@/types/models';
import {
  MOCK_TASKS, MOCK_TEMPLATES, MOCK_PECS, MOCK_MEDIA,
  MOCK_USERS, MOCK_ROLES,
  MOCK_FIND_ODD_ITEMS, MOCK_MATCH_PAIRS, MOCK_SEQUENCE_ITEMS, MOCK_SORT_ITEMS,
  MOCK_TASK_CONSTRUCTIONS
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

async function postWithFallback<T>(endpoint: string, body: unknown, localFallback: () => T): Promise<T | null> {
  if (!API_BASE) return localFallback();
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.warn(`API POST ${endpoint} unavailable, saving locally`);
    return localFallback();
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

  getTaskConstructions: (taskId: number) =>
    fetchWithFallback<TaskConstruction[]>(
      `/api/tasks/${taskId}/constructions`,
      MOCK_TASK_CONSTRUCTIONS.filter(c => c.FK_TaskId === taskId)
    ),

  getTaskFindOddItems: (taskId: number) =>
    fetchWithFallback<FindOddOneOutItem[]>(
      `/api/tasks/${taskId}/find-odd-items`,
      MOCK_FIND_ODD_ITEMS.filter(i => i.FK_TaskId === taskId)
    ),
  getTaskMatchPairs: (taskId: number) =>
    fetchWithFallback<MatchImageWordPair[]>(
      `/api/tasks/${taskId}/match-pairs`,
      MOCK_MATCH_PAIRS.filter(i => i.FK_TaskId === taskId)
    ),
  getTaskSequenceItems: (taskId: number) =>
    fetchWithFallback<SequenceItem[]>(
      `/api/tasks/${taskId}/sequence-items`,
      MOCK_SEQUENCE_ITEMS.filter(i => i.FK_TaskId === taskId)
    ),
  getTaskSortItems: (taskId: number) =>
    fetchWithFallback<SortItem[]>(
      `/api/tasks/${taskId}/sort-items`,
      MOCK_SORT_ITEMS.filter(i => i.FK_TaskId === taskId)
    ),

  // POST - Login
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

  // POST - Create task with all related data
  createFullTask: async (payload: {
    task: Partial<Task>;
    constructions: { ParameterName: string; ParameterValue: string }[];
    findOddItems?: { ItemText: string; IsOddOne: boolean; FK_pecsId?: number }[];
    matchPairs?: { FK_MediaId?: number; FK_pecsId?: number; Words: string }[];
    sequenceItems?: { ItemOrder: number; ItemValue: string; FK_pecsId?: number }[];
    sortItems?: { ItemValue: string; SortKey: string; FK_pecsId?: number }[];
  }): Promise<Task | null> => {
    const { task, constructions, findOddItems, matchPairs, sequenceItems, sortItems } = payload;

    // Try API first
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
        throw new Error(`HTTP ${res.status}`);
      } catch {
        console.warn('API POST /api/tasks/full unavailable, saving locally');
      }
    }

    // Local fallback
    const newTaskId = Date.now();
    const newTask: Task = {
      PK_TaskId: newTaskId,
      Title: task.Title || '',
      FK_TemplateId: task.FK_TemplateId || 1,
      FK_UserId: task.FK_UserId || 1,
      Descripti: task.Descripti,
      DifficultyLevel: task.DifficultyLevel,
    };
    MOCK_TASKS.push(newTask);

    // Save constructions locally
    constructions.forEach((c, idx) => {
      MOCK_TASK_CONSTRUCTIONS.push({
        PK_ConstructionId: Date.now() + idx,
        FK_TaskId: newTaskId,
        ParameterName: c.ParameterName,
        ParameterValue: c.ParameterValue,
      });
    });

    // Save task-specific items locally
    if (findOddItems) {
      findOddItems.forEach((item, idx) => {
        MOCK_FIND_ODD_ITEMS.push({
          PK_ItemId: Date.now() + idx + 100,
          FK_TaskId: newTaskId,
          ItemText: item.ItemText,
          IsOddOne: item.IsOddOne,
          FK_pecsId: item.FK_pecsId,
        });
      });
    }

    if (matchPairs) {
      matchPairs.forEach((pair, idx) => {
        MOCK_MATCH_PAIRS.push({
          PK_PairId: Date.now() + idx + 200,
          FK_TaskId: newTaskId,
          FK_MediaId: pair.FK_MediaId || 0,
          FK_pecsId: pair.FK_pecsId,
          Words: pair.Words,
        });
      });
    }

    if (sequenceItems) {
      sequenceItems.forEach((item, idx) => {
        MOCK_SEQUENCE_ITEMS.push({
          PK_SeqItemId: Date.now() + idx + 300,
          FK_TaskId: newTaskId,
          ItemOrder: item.ItemOrder,
          ItemValue: item.ItemValue,
          FK_pecsId: item.FK_pecsId,
        });
      });
    }

    if (sortItems) {
      sortItems.forEach((item, idx) => {
        MOCK_SORT_ITEMS.push({
          PK_SortItemId: Date.now() + idx + 400,
          FK_TaskId: newTaskId,
          ItemValue: item.ItemValue,
          SortKey: item.SortKey,
          FK_pecsId: item.FK_pecsId,
        });
      });
    }

    return newTask;
  },

  // Legacy simple create
  createTask: async (task: Partial<Task>): Promise<Task | null> => {
    return postWithFallback<Task>('/api/tasks', task, () => {
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
    });
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
