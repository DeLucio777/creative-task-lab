import type {
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember,
} from '@/types/models';
import { apiFetch, apiPost, apiPut, apiDelete as apiDel } from './apiClient';
import {
  MOCK_CHILDREN, MOCK_EDUCATORS, MOCK_REPRESENTATIVES, MOCK_SENSORY_PROFILES,
  MOCK_ASSIGNMENTS, MOCK_PROGRESS, MOCK_REWARDS,
  MOCK_TRAJECTORIES, MOCK_TRAJECTORY_STEPS, MOCK_GROUPS, MOCK_GROUP_MEMBERS,
} from '@/data/mockData';

export const childrenApi = {
  getAll: () => apiFetch<Child[]>('/api/children', MOCK_CHILDREN),
  getById: (id: number) => apiFetch<Child | null>(`/api/children/${id}`, MOCK_CHILDREN.find(c => c.PK_ChildId === id) || null),
  create: async (data: Partial<Child>): Promise<Child | null> => {
    const r = await apiPost<Child>('/api/children', data);
    if (r) return r;
    const c: Child = { PK_ChildId: Date.now(), FullName: data.FullName || '', ...data } as Child;
    MOCK_CHILDREN.push(c);
    return c;
  },
  update: async (id: number, data: Partial<Child>): Promise<Child | null> => {
    const r = await apiPut<Child>(`/api/children/${id}`, data);
    if (r) return r;
    const idx = MOCK_CHILDREN.findIndex(c => c.PK_ChildId === id);
    if (idx >= 0) Object.assign(MOCK_CHILDREN[idx], data);
    return MOCK_CHILDREN[idx] || null;
  },
  delete: async (id: number) => {
    if (await apiDel(`/api/children/${id}`)) return true;
    const idx = MOCK_CHILDREN.findIndex(c => c.PK_ChildId === id);
    if (idx >= 0) { MOCK_CHILDREN.splice(idx, 1); return true; }
    return false;
  },
};

export const educatorsApi = {
  getAll: () => apiFetch<Educator[]>('/api/educators', MOCK_EDUCATORS),
  getById: (id: number) => apiFetch<Educator | null>(`/api/educators/${id}`, MOCK_EDUCATORS.find(e => e.PK_EducatorId === id) || null),
  create: async (data: Partial<Educator>): Promise<Educator | null> => {
    const r = await apiPost<Educator>('/api/educators', data);
    if (r) return r;
    const e: Educator = { PK_EducatorId: Date.now(), FK_UserId: data.FK_UserId || 0, FullName: data.FullName || '', ...data } as Educator;
    MOCK_EDUCATORS.push(e);
    return e;
  },
  update: async (id: number, data: Partial<Educator>) => apiPut<Educator>(`/api/educators/${id}`, data),
  delete: async (id: number) => {
    if (await apiDel(`/api/educators/${id}`)) return true;
    const idx = MOCK_EDUCATORS.findIndex(e => e.PK_EducatorId === id);
    if (idx >= 0) { MOCK_EDUCATORS.splice(idx, 1); return true; }
    return false;
  },
};

export const representativesApi = {
  getAll: () => apiFetch<LegalRepresentative[]>('/api/representatives', MOCK_REPRESENTATIVES),
  getById: (id: number) => apiFetch<LegalRepresentative | null>(`/api/representatives/${id}`, MOCK_REPRESENTATIVES.find(r => r.PK_RepresentativeId === id) || null),
  create: async (data: Partial<LegalRepresentative>): Promise<LegalRepresentative | null> => {
    const r = await apiPost<LegalRepresentative>('/api/representatives', data);
    if (r) return r;
    const rep: LegalRepresentative = { PK_RepresentativeId: Date.now(), FK_UserId: data.FK_UserId || 0, FullName: data.FullName || '', ...data } as LegalRepresentative;
    MOCK_REPRESENTATIVES.push(rep);
    return rep;
  },
  update: async (id: number, data: Partial<LegalRepresentative>) => apiPut<LegalRepresentative>(`/api/representatives/${id}`, data),
  delete: async (id: number) => {
    if (await apiDel(`/api/representatives/${id}`)) return true;
    const idx = MOCK_REPRESENTATIVES.findIndex(r => r.PK_RepresentativeId === id);
    if (idx >= 0) { MOCK_REPRESENTATIVES.splice(idx, 1); return true; }
    return false;
  },
};

export const sensoryApi = {
  getByChild: (childId: number) => apiFetch<SensoryProfile | null>(`/api/children/${childId}/sensory-profile`, MOCK_SENSORY_PROFILES.find(s => s.FK_ChildId === childId) || null),
  save: async (childId: number, data: Partial<SensoryProfile>): Promise<SensoryProfile | null> => {
    const r = await apiPost<SensoryProfile>(`/api/children/${childId}/sensory-profile`, data);
    if (r) return r;
    const existing = MOCK_SENSORY_PROFILES.findIndex(s => s.FK_ChildId === childId);
    const profile: SensoryProfile = { PK_ProfileId: Date.now(), FK_ChildId: childId, ...data } as SensoryProfile;
    if (existing >= 0) MOCK_SENSORY_PROFILES[existing] = profile;
    else MOCK_SENSORY_PROFILES.push(profile);
    return profile;
  },
};

export const assignmentsApi = {
  getAll: () => apiFetch<TaskAssignment[]>('/api/assignments', MOCK_ASSIGNMENTS),
  getByChild: (childId: number) => apiFetch<TaskAssignment[]>(`/api/children/${childId}/assignments`, MOCK_ASSIGNMENTS.filter(a => a.FK_ChildId === childId)),
  create: async (data: Partial<TaskAssignment>): Promise<TaskAssignment | null> => {
    const r = await apiPost<TaskAssignment>('/api/assignments', data);
    if (r) return r;
    const a: TaskAssignment = {
      PK_AssignmentId: Date.now(),
      FK_TaskId: data.FK_TaskId || 0,
      FK_ChildId: data.FK_ChildId || 0,
      AssignedDate: new Date().toISOString(),
      Status: 'pending', ...data,
    } as TaskAssignment;
    MOCK_ASSIGNMENTS.push(a);
    return a;
  },
  updateStatus: async (id: number, status: TaskAssignment['Status']) => apiPut<TaskAssignment>(`/api/assignments/${id}`, { status }),
};

export const progressApi = {
  getAll: () => apiFetch<ProgressRecord[]>('/api/progress', MOCK_PROGRESS),
  getByChild: (childId: number) => apiFetch<ProgressRecord[]>(`/api/children/${childId}/progress`, MOCK_PROGRESS.filter(p => p.FK_ChildId === childId)),
  create: async (data: Partial<ProgressRecord>): Promise<ProgressRecord | null> => {
    const r = await apiPost<ProgressRecord>('/api/progress', data);
    if (r) return r;
    const p: ProgressRecord = {
      PK_ProgressId: Date.now(),
      FK_AssignmentId: data.FK_AssignmentId || 0,
      FK_ChildId: data.FK_ChildId || 0,
      CompletedDate: new Date().toISOString(),
      ErrorCount: data.ErrorCount || 0,
      HintsUsed: data.HintsUsed || 0,
      IsCorrect: data.IsCorrect ?? false,
      ...data,
    } as ProgressRecord;
    MOCK_PROGRESS.push(p);
    return p;
  },
};

export const rewardsApi = {
  getByChild: (childId: number) => apiFetch<Reward[]>(`/api/children/${childId}/rewards`, MOCK_REWARDS.filter(r => r.FK_ChildId === childId)),
  create: async (data: Partial<Reward>): Promise<Reward | null> => {
    const r = await apiPost<Reward>('/api/rewards', data);
    if (r) return r;
    const reward: Reward = {
      PK_RewardId: Date.now(),
      FK_ChildId: data.FK_ChildId || 0,
      RewardType: data.RewardType || 'star',
      RewardValue: data.RewardValue || '⭐',
      EarnedDate: new Date().toISOString(),
      ...data,
    } as Reward;
    MOCK_REWARDS.push(reward);
    return reward;
  },
};

export const trajectoriesApi = {
  getAll: () => apiFetch<LearningTrajectory[]>('/api/trajectories', MOCK_TRAJECTORIES),
  getSteps: (id: number) => apiFetch<TrajectoryStep[]>(`/api/trajectories/${id}/steps`, MOCK_TRAJECTORY_STEPS.filter(s => s.FK_TrajectoryId === id)),
  create: async (data: Partial<LearningTrajectory>): Promise<LearningTrajectory | null> => {
    const r = await apiPost<LearningTrajectory>('/api/trajectories', data);
    if (r) return r;
    const t: LearningTrajectory = { PK_TrajectoryId: Date.now(), TrajectoryName: data.TrajectoryName || '', FK_EducatorId: data.FK_EducatorId || 0, ...data } as LearningTrajectory;
    MOCK_TRAJECTORIES.push(t);
    return t;
  },
};

export const groupsApi = {
  getAll: () => apiFetch<ChildGroup[]>('/api/groups', MOCK_GROUPS),
  getMembers: (groupId: number) => apiFetch<ChildGroupMember[]>(`/api/groups/${groupId}/members`, MOCK_GROUP_MEMBERS.filter(m => m.FK_GroupId === groupId)),
  create: async (data: Partial<ChildGroup>): Promise<ChildGroup | null> => {
    const r = await apiPost<ChildGroup>('/api/groups', data);
    if (r) return r;
    const g: ChildGroup = { PK_GroupId: Date.now(), GroupName: data.GroupName || '', FK_EducatorId: data.FK_EducatorId || 0, ...data } as ChildGroup;
    MOCK_GROUPS.push(g);
    return g;
  },
  addMember: async (groupId: number, childId: number) => apiPost<ChildGroupMember>(`/api/groups/${groupId}/members`, { childId }),
};
