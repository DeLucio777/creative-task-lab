import type {
  Task, TaskTemplate, TaskConstruction,
  FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem,
} from '@/types/models';
import { apiGet, apiPost, apiPut, apiDelete, safe } from './apiClient';

export interface FullTaskPayload {
  task: Partial<Task>;
  constructions: { ParameterName: string; ParameterValue: string }[];
  findOddItems?: { ItemText: string; IsOddOne: boolean; FK_pecsId?: number }[];
  matchPairs?: { FK_MediaId?: number; FK_pecsId?: number; Words: string }[];
  sequenceItems?: { ItemOrder: number; ItemValue: string; FK_pecsId?: number }[];
  sortItems?: { ItemValue: string; SortKey: string; FK_pecsId?: number }[];
}

export const tasksApi = {
  getTasks: (): Promise<Task[]> => safe(apiGet<Task[]>('/api/tasks'), []),
  getTask: (id: number): Promise<Task | null> => safe(apiGet<Task>(`/api/tasks/${id}`), null),
  getTemplates: (): Promise<TaskTemplate[]> => safe(apiGet<TaskTemplate[]>('/api/templates'), []),

  getTaskConstructions: (taskId: number): Promise<TaskConstruction[]> =>
    safe(apiGet<TaskConstruction[]>(`/api/tasks/${taskId}/constructions`), []),
  getTaskFindOddItems: (taskId: number): Promise<FindOddOneOutItem[]> =>
    safe(apiGet<FindOddOneOutItem[]>(`/api/tasks/${taskId}/find-odd-items`), []),
  getTaskMatchPairs: (taskId: number): Promise<MatchImageWordPair[]> =>
    safe(apiGet<MatchImageWordPair[]>(`/api/tasks/${taskId}/match-pairs`), []),
  getTaskSequenceItems: (taskId: number): Promise<SequenceItem[]> =>
    safe(apiGet<SequenceItem[]>(`/api/tasks/${taskId}/sequence-items`), []),
  getTaskSortItems: (taskId: number): Promise<SortItem[]> =>
    safe(apiGet<SortItem[]>(`/api/tasks/${taskId}/sort-items`), []),

  createTask: (task: Partial<Task>): Promise<Task | null> =>
    safe(apiPost<Task>('/api/tasks', task), null),
  createFullTask: (payload: FullTaskPayload): Promise<Task | null> =>
    safe(apiPost<Task>('/api/tasks/full', payload), null),
  updateFullTask: (taskId: number, payload: FullTaskPayload): Promise<Task | null> =>
    safe(apiPut<Task>(`/api/tasks/${taskId}/full`, payload), null),

  deleteTask: async (taskId: number): Promise<boolean> => {
    try { await apiDelete(`/api/tasks/${taskId}`); return true; }
    catch { return await safe(Promise.reject(new Error('delete failed')), false); }
  },

  publishTask: async (taskId: number, published: boolean): Promise<boolean> => {
    const r = await safe(apiPost<Task>(`/api/tasks/${taskId}/publish`, { published }), null);
    return r !== null;
  },
};
