import type {
  Task, TaskTemplate, TaskConstruction,
  FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem,
} from '@/types/models';
import { apiFetch, apiPost, apiDelete as apiDel } from './apiClient';
import {
  MOCK_TASKS, MOCK_TEMPLATES, MOCK_TASK_CONSTRUCTIONS,
  MOCK_FIND_ODD_ITEMS, MOCK_MATCH_PAIRS, MOCK_SEQUENCE_ITEMS, MOCK_SORT_ITEMS,
} from '@/data/mockData';

export const tasksApi = {
  getTasks: () => apiFetch<Task[]>('/api/tasks', MOCK_TASKS),
  getTask: (id: number) =>
    apiFetch<Task | null>(`/api/tasks/${id}`, MOCK_TASKS.find(t => t.PK_TaskId === id) || null),
  getTemplates: () => apiFetch<TaskTemplate[]>('/api/templates', MOCK_TEMPLATES),

  getTaskConstructions: (taskId: number) =>
    apiFetch<TaskConstruction[]>(`/api/tasks/${taskId}/constructions`,
      MOCK_TASK_CONSTRUCTIONS.filter(c => c.FK_TaskId === taskId)),
  getTaskFindOddItems: (taskId: number) =>
    apiFetch<FindOddOneOutItem[]>(`/api/tasks/${taskId}/find-odd-items`,
      MOCK_FIND_ODD_ITEMS.filter(i => i.FK_TaskId === taskId)),
  getTaskMatchPairs: (taskId: number) =>
    apiFetch<MatchImageWordPair[]>(`/api/tasks/${taskId}/match-pairs`,
      MOCK_MATCH_PAIRS.filter(i => i.FK_TaskId === taskId)),
  getTaskSequenceItems: (taskId: number) =>
    apiFetch<SequenceItem[]>(`/api/tasks/${taskId}/sequence-items`,
      MOCK_SEQUENCE_ITEMS.filter(i => i.FK_TaskId === taskId)),
  getTaskSortItems: (taskId: number) =>
    apiFetch<SortItem[]>(`/api/tasks/${taskId}/sort-items`,
      MOCK_SORT_ITEMS.filter(i => i.FK_TaskId === taskId)),

  createTask: async (task: Partial<Task>): Promise<Task | null> => {
    const result = await apiPost<Task>('/api/tasks', task);
    if (result) return result;
    const newTask: Task = {
      PK_TaskId: Date.now(),
      Title: task.Title || '',
      FK_TemplateId: task.FK_TemplateId || 1,
      FK_UserId: task.FK_UserId || 1,
      Descripti: task.Descripti,
      DifficultyLevel: task.DifficultyLevel,
      CreatedDate: new Date().toISOString(),
    };
    MOCK_TASKS.push(newTask);
    return newTask;
  },

  createFullTask: async (payload: {
    task: Partial<Task>;
    constructions: { ParameterName: string; ParameterValue: string }[];
    findOddItems?: { ItemText: string; IsOddOne: boolean; FK_pecsId?: number }[];
    matchPairs?: { FK_MediaId?: number; FK_pecsId?: number; Words: string }[];
    sequenceItems?: { ItemOrder: number; ItemValue: string; FK_pecsId?: number }[];
    sortItems?: { ItemValue: string; SortKey: string; FK_pecsId?: number }[];
  }): Promise<Task | null> => {
    const result = await apiPost<Task>('/api/tasks/full', payload);
    if (result) return result;

    const { task, constructions, findOddItems, matchPairs, sequenceItems, sortItems } = payload;
    const newTaskId = Date.now();
    const newTask: Task = {
      PK_TaskId: newTaskId,
      Title: task.Title || '',
      FK_TemplateId: task.FK_TemplateId || 1,
      FK_UserId: task.FK_UserId || 1,
      Descripti: task.Descripti,
      DifficultyLevel: task.DifficultyLevel,
      CreatedDate: new Date().toISOString(),
    };
    MOCK_TASKS.push(newTask);

    constructions.forEach((c, idx) => {
      MOCK_TASK_CONSTRUCTIONS.push({ PK_ConstructionId: Date.now() + idx, FK_TaskId: newTaskId, ...c });
    });
    findOddItems?.forEach((item, idx) => {
      MOCK_FIND_ODD_ITEMS.push({ PK_ItemId: Date.now() + idx + 100, FK_TaskId: newTaskId, ...item });
    });
    matchPairs?.forEach((pair, idx) => {
      MOCK_MATCH_PAIRS.push({ PK_PairId: Date.now() + idx + 200, FK_TaskId: newTaskId, FK_MediaId: pair.FK_MediaId || 0, ...pair });
    });
    sequenceItems?.forEach((item, idx) => {
      MOCK_SEQUENCE_ITEMS.push({ PK_SeqItemId: Date.now() + idx + 300, FK_TaskId: newTaskId, ...item });
    });
    sortItems?.forEach((item, idx) => {
      MOCK_SORT_ITEMS.push({ PK_SortItemId: Date.now() + idx + 400, FK_TaskId: newTaskId, ...item });
    });
    return newTask;
  },

  deleteTask: async (taskId: number): Promise<boolean> => {
    const ok = await apiDel(`/api/tasks/${taskId}`);
    if (ok) return true;
    const idx = MOCK_TASKS.findIndex(t => t.PK_TaskId === taskId);
    if (idx === -1) return false;
    MOCK_TASKS.splice(idx, 1);
    [MOCK_FIND_ODD_ITEMS, MOCK_MATCH_PAIRS, MOCK_SEQUENCE_ITEMS, MOCK_SORT_ITEMS, MOCK_TASK_CONSTRUCTIONS]
      .forEach(arr => { for (let i = arr.length - 1; i >= 0; i--) if ((arr[i] as any).FK_TaskId === taskId) arr.splice(i, 1); });
    return true;
  },

  publishTask: async (taskId: number, published: boolean): Promise<boolean> => {
    const result = await apiPost<Task>(`/api/tasks/${taskId}/publish`, { published });
    if (result) return true;
    const task = MOCK_TASKS.find(t => t.PK_TaskId === taskId);
    if (task) { task.IsPublished = published; return true; }
    return false;
  },
};
