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

  getAllConstructions: (): Promise<TaskConstruction[]> =>
    safe(apiGet<TaskConstruction[]>('/api/task-constructions'), []),
  getAllFindOddItems: (): Promise<FindOddOneOutItem[]> =>
    safe(apiGet<FindOddOneOutItem[]>('/api/find-odd-items'), []),
  getAllMatchPairs: (): Promise<MatchImageWordPair[]> =>
    safe(apiGet<MatchImageWordPair[]>('/api/match-pairs'), []),
  getAllSequenceItems: (): Promise<SequenceItem[]> =>
    safe(apiGet<SequenceItem[]>('/api/sequence-items'), []),
  getAllSortItems: (): Promise<SortItem[]> =>
    safe(apiGet<SortItem[]>('/api/sort-items'), []),

  getTaskConstructions: async (taskId: number): Promise<TaskConstruction[]> =>
    (await tasksApi.getAllConstructions()).filter(c => c.FK_TaskId === taskId),
  getTaskFindOddItems: async (taskId: number): Promise<FindOddOneOutItem[]> =>
    (await tasksApi.getAllFindOddItems()).filter(i => i.FK_TaskId === taskId),
  getTaskMatchPairs: async (taskId: number): Promise<MatchImageWordPair[]> =>
    (await tasksApi.getAllMatchPairs()).filter(i => i.FK_TaskId === taskId),
  getTaskSequenceItems: async (taskId: number): Promise<SequenceItem[]> =>
    (await tasksApi.getAllSequenceItems()).filter(i => i.FK_TaskId === taskId),
  getTaskSortItems: async (taskId: number): Promise<SortItem[]> =>
    (await tasksApi.getAllSortItems()).filter(i => i.FK_TaskId === taskId),

  createFullTask: (payload: FullTaskPayload): Promise<Task | null> =>
    safe(apiPost<Task>('/api/tasks/full', payload), null),
  updateFullTask: (taskId: number, payload: FullTaskPayload): Promise<Task | null> =>
    safe(apiPut<Task>(`/api/tasks/${taskId}/full`, payload), null),

  deleteTask: async (taskId: number): Promise<boolean> => {
    try { await apiDelete(`/api/tasks/${taskId}`); return true; } catch { return false; }
  },

  publishTask: async (taskId: number, published: boolean): Promise<boolean> => {
    const r = await safe(apiPost<Task>(`/api/tasks/${taskId}/publish`, { public_task: published }), null);
    return r !== null;
  },
};
