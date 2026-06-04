import type {
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember,
  Disease, UserInfo, Achievement, UserAchievement,
  TaskList, TaskListItem, User,
} from '@/types/models';
import { apiGet, apiPost, apiPut, apiDelete, safe } from './apiClient';

/* ─────────── Children ─────────── */
export const childrenApi = {
  getAll: (): Promise<Child[]> => safe(apiGet<Child[]>('/api/children'), []),
  getById: (id: number): Promise<Child | null> => safe(apiGet<Child>(`/api/children/${id}`), null),
  getByEducator: (educatorId: number): Promise<Child[]> =>
    safe(apiGet<Child[]>(`/api/educators/${educatorId}/children`), []),
  getByRepresentative: (repId: number): Promise<Child[]> =>
    safe(apiGet<Child[]>(`/api/representatives/${repId}/children`), []),
  create: (data: Partial<Child>): Promise<Child | null> =>
    safe(apiPost<Child>('/api/children', data), null),
  update: (id: number, data: Partial<Child>): Promise<Child | null> =>
    safe(apiPut<Child>(`/api/children/${id}`, data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/children/${id}`); return true; } catch { return false; }
  },
};

/* ─────────── Educators ─────────── */
export interface EducatorCreate extends Partial<Educator> {
  UserLogin?: string;
  UserPassword?: string;
}
export const educatorsApi = {
  getAll: (): Promise<Educator[]> => safe(apiGet<Educator[]>('/api/educators'), []),
  getById: (id: number): Promise<Educator | null> => safe(apiGet<Educator>(`/api/educators/${id}`), null),
  getByUserId: (userId: number): Promise<Educator | null> =>
    safe(apiGet<Educator>(`/api/users/${userId}/educator`), null),
  create: (data: EducatorCreate): Promise<Educator | null> =>
    safe(apiPost<Educator>('/api/educators', data), null),
  update: (id: number, data: Partial<Educator>): Promise<Educator | null> =>
    safe(apiPut<Educator>(`/api/educators/${id}`, data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/educators/${id}`); return true; } catch { return false; }
  },
};

/* ─────────── Representatives ─────────── */
export interface RepresentativeCreate extends Partial<LegalRepresentative> {
  UserLogin?: string;
  UserPassword?: string;
}
export const representativesApi = {
  getAll: (): Promise<LegalRepresentative[]> =>
    safe(apiGet<LegalRepresentative[]>('/api/representatives'), []),
  getByUserId: (userId: number): Promise<LegalRepresentative | null> =>
    safe(apiGet<LegalRepresentative>(`/api/users/${userId}/representative`), null),
  create: (data: RepresentativeCreate): Promise<LegalRepresentative | null> =>
    safe(apiPost<LegalRepresentative>('/api/representatives', data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/representatives/${id}`); return true; } catch { return false; }
  },
};

/* ─────────── Users ─────────── */
export const usersApi = {
  getAll: (): Promise<User[]> => safe(apiGet<User[]>('/api/users'), []),
  getById: (id: number): Promise<User | null> => safe(apiGet<User>(`/api/users/${id}`), null),
  update: (id: number, data: Partial<User>): Promise<User | null> =>
    safe(apiPut<User>(`/api/users/${id}`, data), null),
};

/* ─────────── Sensory profile ─────────── */
export const sensoryApi = {
  getByChild: (childId: number): Promise<SensoryProfile | null> =>
    safe(apiGet<SensoryProfile>(`/api/children/${childId}/sensory-profile`), null),
  save: (childId: number, data: Partial<SensoryProfile>): Promise<SensoryProfile | null> =>
    safe(apiPost<SensoryProfile>(`/api/children/${childId}/sensory-profile`, data), null),
};

/* ─────────── Diseases ─────────── */
export const diseasesApi = {
  getAll: (): Promise<Disease[]> => safe(apiGet<Disease[]>('/api/diseases'), []),
};

/* ─────────── User info ─────────── */
export const userInfoApi = {
  getByUser: (userId: number): Promise<UserInfo | null> =>
    safe(apiGet<UserInfo>(`/api/users/${userId}/info`), null),
  save: (userId: number, data: Partial<UserInfo>): Promise<UserInfo | null> =>
    safe(apiPost<UserInfo>(`/api/users/${userId}/info`, data), null),
};

/* ─────────── Assignments ─────────── */
export const assignmentsApi = {
  getAll: (): Promise<TaskAssignment[]> => safe(apiGet<TaskAssignment[]>('/api/assignments'), []),
  getByChild: (childId: number): Promise<TaskAssignment[]> =>
    safe(apiGet<TaskAssignment[]>(`/api/children/${childId}/assignments`), []),
  create: (data: Partial<TaskAssignment>): Promise<TaskAssignment | null> =>
    safe(apiPost<TaskAssignment>('/api/assignments', data), null),
  updateStatus: (id: number, status: TaskAssignment['Status']): Promise<TaskAssignment | null> =>
    safe(apiPut<TaskAssignment>(`/api/assignments/${id}/status`, { status }), null),
};

/* ─────────── Progress ─────────── */
export const progressApi = {
  getAll: (): Promise<ProgressRecord[]> => safe(apiGet<ProgressRecord[]>('/api/progress'), []),
  getByChild: (childId: number): Promise<ProgressRecord[]> =>
    safe(apiGet<ProgressRecord[]>(`/api/children/${childId}/progress`), []),
  create: (data: Partial<ProgressRecord>): Promise<ProgressRecord | null> =>
    safe(apiPost<ProgressRecord>('/api/progress', data), null),
};

/* ─────────── Rewards ─────────── */
export const rewardsApi = {
  getByChild: (childId: number): Promise<Reward[]> =>
    safe(apiGet<Reward[]>(`/api/children/${childId}/rewards`), []),
};

/* ─────────── Trajectories ─────────── */
export const trajectoriesApi = {
  getAll: (): Promise<LearningTrajectory[]> =>
    safe(apiGet<LearningTrajectory[]>('/api/trajectories'), []),
  getSteps: (id: number): Promise<TrajectoryStep[]> =>
    safe(apiGet<TrajectoryStep[]>(`/api/trajectories/${id}/steps`), []),
  create: (data: Partial<LearningTrajectory>): Promise<LearningTrajectory | null> =>
    safe(apiPost<LearningTrajectory>('/api/trajectories', data), null),
};

/* ─────────── Groups ─────────── */
export const groupsApi = {
  getAll: (): Promise<ChildGroup[]> => safe(apiGet<ChildGroup[]>('/api/groups'), []),
  getByEducator: (educatorId: number): Promise<ChildGroup[]> =>
    safe(apiGet<ChildGroup[]>(`/api/educators/${educatorId}/groups`), []),
  getMembers: (groupId: number): Promise<ChildGroupMember[]> =>
    safe(apiGet<ChildGroupMember[]>(`/api/groups/${groupId}/members`), []),
  create: (data: Partial<ChildGroup>): Promise<ChildGroup | null> =>
    safe(apiPost<ChildGroup>('/api/groups', data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/groups/${id}`); return true; } catch { return false; }
  },
  addMember: (groupId: number, childId: number): Promise<ChildGroupMember | null> =>
    safe(apiPost<ChildGroupMember>(`/api/groups/${groupId}/members`, { childId }), null),
  removeMember: async (memberId: number): Promise<boolean> => {
    try { await apiDelete(`/api/group-members/${memberId}`); return true; } catch { return false; }
  },
};

/* ─────────── Achievements ─────────── */
export const achievementsApi = {
  getAll: (): Promise<Achievement[]> => safe(apiGet<Achievement[]>('/api/achievements'), []),
  getByUser: (userId: number): Promise<UserAchievement[]> =>
    safe(apiGet<UserAchievement[]>(`/api/users/${userId}/achievements`), []),
  award: (userId: number, achievementId: number): Promise<UserAchievement | null> =>
    safe(apiPost<UserAchievement>(`/api/users/${userId}/achievements`, { achievementId }), null),
};

/* ─────────── Task lists ─────────── */
export interface TaskListCreate {
  Title: string;
  Descripti?: string;
  teacher_id: number;
  date_complite?: string;
  taskIds: number[];
  userIds: number[];
}
export interface TaskListStatus { total: number; done: number; isDone: boolean }
export interface NextInChain { listId: number; nextTaskId: number; position: number }

export const taskListsApi = {
  getAll: (): Promise<TaskList[]> => safe(apiGet<TaskList[]>('/api/task-lists'), []),
  getByTeacher: (teacherId: number): Promise<TaskList[]> =>
    safe(apiGet<TaskList[]>(`/api/teachers/${teacherId}/task-lists`), []),
  getByUser: (userId: number): Promise<TaskList[]> =>
    safe(apiGet<TaskList[]>(`/api/users/${userId}/task-lists`), []),
  getItems: (listId: number): Promise<TaskListItem[]> =>
    safe(apiGet<TaskListItem[]>(`/api/task-lists/${listId}/items`), []),
  getItemsForUser: (listId: number, userId: number): Promise<TaskListItem[]> =>
    safe(apiGet<TaskListItem[]>(`/api/task-lists/${listId}/items?user=${userId}`), []),

  create: (data: TaskListCreate): Promise<TaskList | null> =>
    safe(apiPost<TaskList>('/api/task-lists', data), null),

  markCompleted: (itemId: number): Promise<TaskListItem | null> =>
    safe(apiPut<TaskListItem>(`/api/task-list-items/${itemId}/complete`, {}), null),

  markTaskCompletedForUser: (taskId: number, userId: number): Promise<TaskListItem[]> =>
    safe(apiPost<TaskListItem[]>(`/api/task-list-items/complete-for-user`, { taskId, userId }), []),

  getStatusesForUser: (userId: number): Promise<Record<number, TaskListStatus>> =>
    safe(apiGet<Record<number, TaskListStatus>>(`/api/users/${userId}/task-list-statuses`), {}),

  getNextInChainsForUser: (currentTaskId: number, userId: number): Promise<NextInChain | null> =>
    safe(apiGet<NextInChain>(`/api/users/${userId}/next-in-chain?task=${currentTaskId}`), null),

  delete: async (listId: number): Promise<boolean> => {
    try { await apiDelete(`/api/task-lists/${listId}`); return true; } catch { return false; }
  },
};
