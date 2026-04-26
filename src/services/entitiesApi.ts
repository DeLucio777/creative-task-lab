import type {
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember,
  Disease, UserInfo, Achievement, UserAchievement,
  TaskList, TaskListItem, User,
} from '@/types/models';
import { apiFetch, apiPost, apiPut, apiDelete as apiDel } from './apiClient';
import {
  MOCK_CHILDREN, MOCK_EDUCATORS, MOCK_REPRESENTATIVES, MOCK_SENSORY_PROFILES,
  MOCK_ASSIGNMENTS, MOCK_PROGRESS, MOCK_REWARDS,
  MOCK_TRAJECTORIES, MOCK_TRAJECTORY_STEPS, MOCK_GROUPS, MOCK_GROUP_MEMBERS,
  MOCK_DISEASES, MOCK_USER_INFO, MOCK_ACHIEVEMENTS, MOCK_USER_ACHIEVEMENTS,
  MOCK_TASK_LISTS, MOCK_TASK_LIST_ITEMS, MOCK_USERS,
} from '@/data/mockData';

const nextId = (arr: { [k: string]: any }[], key: string) =>
  (arr.reduce((m, x) => Math.max(m, x[key] || 0), 0) || 0) + 1;

/* ── Children ── */
export const childrenApi = {
  getAll: () => apiFetch<Child[]>('/api/children', MOCK_CHILDREN),
  getById: (id: number) => apiFetch<Child | null>(`/api/children/${id}`, MOCK_CHILDREN.find(c => c.PK_ChildId === id) || null),
  getByEducator: (educatorId: number) => apiFetch<Child[]>(`/api/educators/${educatorId}/children`, MOCK_CHILDREN.filter(c => c.FK_EducatorId === educatorId)),
  getByRepresentative: (repId: number) => apiFetch<Child[]>(`/api/representatives/${repId}/children`, MOCK_CHILDREN.filter(c => c.FK_RepresentativeId === repId)),
  create: async (data: Partial<Child>): Promise<Child | null> => {
    const r = await apiPost<Child>('/api/children', data); if (r) return r;
    const c: Child = { PK_ChildId: nextId(MOCK_CHILDREN, 'PK_ChildId'), FullName: data.FullName || '', ...data } as Child;
    MOCK_CHILDREN.push(c); return c;
  },
  update: async (id: number, data: Partial<Child>): Promise<Child | null> => {
    const r = await apiPut<Child>(`/api/children/${id}`, data); if (r) return r;
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

/* ── Educators ── */
export const educatorsApi = {
  getAll: () => apiFetch<Educator[]>('/api/educators', MOCK_EDUCATORS),
  getById: (id: number) => apiFetch<Educator | null>(`/api/educators/${id}`, MOCK_EDUCATORS.find(e => e.PK_EducatorId === id) || null),
  getByUserId: (userId: number) => apiFetch<Educator | null>(`/api/users/${userId}/educator`, MOCK_EDUCATORS.find(e => e.FK_UserId === userId) || null),
  create: async (data: Partial<Educator> & { UserLogin?: string; UserPassword?: string }): Promise<Educator | null> => {
    const r = await apiPost<Educator>('/api/educators', data); if (r) return r;
    // создаём связанного User, если передан логин
    let userId = data.FK_UserId || 0;
    if (!userId && data.UserLogin) {
      const u: User = { PK_UserId: nextId(MOCK_USERS, 'PK_UserId'), UserLogin: data.UserLogin, UserPassword: data.UserPassword || '', FK_RoleId: 2,
        first_name: (data.FullName || '').split(' ')[1], second_name: (data.FullName || '').split(' ')[0], phone: data.Phone };
      MOCK_USERS.push(u); userId = u.PK_UserId;
    }
    const e: Educator = { PK_EducatorId: nextId(MOCK_EDUCATORS, 'PK_EducatorId'), FK_UserId: userId, FullName: data.FullName || '', Specialization: data.Specialization, Phone: data.Phone, Email: data.Email };
    MOCK_EDUCATORS.push(e); return e;
  },
  update: async (id: number, data: Partial<Educator>) => {
    const r = await apiPut<Educator>(`/api/educators/${id}`, data); if (r) return r;
    const idx = MOCK_EDUCATORS.findIndex(e => e.PK_EducatorId === id);
    if (idx >= 0) Object.assign(MOCK_EDUCATORS[idx], data);
    return MOCK_EDUCATORS[idx] || null;
  },
  delete: async (id: number) => {
    if (await apiDel(`/api/educators/${id}`)) return true;
    const idx = MOCK_EDUCATORS.findIndex(e => e.PK_EducatorId === id);
    if (idx >= 0) { MOCK_EDUCATORS.splice(idx, 1); return true; }
    return false;
  },
};

/* ── Representatives ── */
export const representativesApi = {
  getAll: () => apiFetch<LegalRepresentative[]>('/api/representatives', MOCK_REPRESENTATIVES),
  getByUserId: (userId: number) => apiFetch<LegalRepresentative | null>(`/api/users/${userId}/representative`, MOCK_REPRESENTATIVES.find(r => r.FK_UserId === userId) || null),
  create: async (data: Partial<LegalRepresentative> & { UserLogin?: string; UserPassword?: string }): Promise<LegalRepresentative | null> => {
    const r = await apiPost<LegalRepresentative>('/api/representatives', data); if (r) return r;
    let userId = data.FK_UserId || 0;
    if (!userId && data.UserLogin) {
      const u: User = { PK_UserId: nextId(MOCK_USERS, 'PK_UserId'), UserLogin: data.UserLogin, UserPassword: data.UserPassword || '', FK_RoleId: 3,
        first_name: (data.FullName || '').split(' ')[1], second_name: (data.FullName || '').split(' ')[0], phone: data.Phone };
      MOCK_USERS.push(u); userId = u.PK_UserId;
    }
    const rep: LegalRepresentative = { PK_RepresentativeId: nextId(MOCK_REPRESENTATIVES, 'PK_RepresentativeId'), FK_UserId: userId, FullName: data.FullName || '', RelationType: data.RelationType, Phone: data.Phone, Email: data.Email };
    MOCK_REPRESENTATIVES.push(rep); return rep;
  },
  delete: async (id: number) => {
    if (await apiDel(`/api/representatives/${id}`)) return true;
    const idx = MOCK_REPRESENTATIVES.findIndex(r => r.PK_RepresentativeId === id);
    if (idx >= 0) { MOCK_REPRESENTATIVES.splice(idx, 1); return true; }
    return false;
  },
};

/* ── Users (профиль) ── */
export const usersApi = {
  getAll: () => apiFetch<User[]>('/api/users', MOCK_USERS),
  getById: (id: number) => apiFetch<User | null>(`/api/users/${id}`, MOCK_USERS.find(u => u.PK_UserId === id) || null),
  update: async (id: number, data: Partial<User>): Promise<User | null> => {
    const r = await apiPut<User>(`/api/users/${id}`, data); if (r) return r;
    const idx = MOCK_USERS.findIndex(u => u.PK_UserId === id);
    if (idx >= 0) Object.assign(MOCK_USERS[idx], data);
    return MOCK_USERS[idx] || null;
  },
};

/* ── Sensory ── */
export const sensoryApi = {
  getByChild: (childId: number) => apiFetch<SensoryProfile | null>(`/api/children/${childId}/sensory-profile`, MOCK_SENSORY_PROFILES.find(s => s.FK_ChildId === childId) || null),
  save: async (childId: number, data: Partial<SensoryProfile>): Promise<SensoryProfile | null> => {
    const r = await apiPost<SensoryProfile>(`/api/children/${childId}/sensory-profile`, data); if (r) return r;
    const existing = MOCK_SENSORY_PROFILES.findIndex(s => s.FK_ChildId === childId);
    const profile: SensoryProfile = { PK_ProfileId: existing >= 0 ? MOCK_SENSORY_PROFILES[existing].PK_ProfileId : nextId(MOCK_SENSORY_PROFILES, 'PK_ProfileId'), FK_ChildId: childId, ...data } as SensoryProfile;
    if (existing >= 0) MOCK_SENSORY_PROFILES[existing] = profile; else MOCK_SENSORY_PROFILES.push(profile);
    return profile;
  },
};

/* ── Diseases ── */
export const diseasesApi = {
  getAll: () => apiFetch<Disease[]>('/api/diseases', MOCK_DISEASES),
};

/* ── User Info ── */
export const userInfoApi = {
  getByUser: (userId: number) => apiFetch<UserInfo | null>(`/api/users/${userId}/info`, MOCK_USER_INFO.find(i => i.FK_user_id === userId) || null),
  save: async (userId: number, data: Partial<UserInfo>): Promise<UserInfo | null> => {
    const r = await apiPost<UserInfo>(`/api/users/${userId}/info`, data); if (r) return r;
    const idx = MOCK_USER_INFO.findIndex(i => i.FK_user_id === userId);
    const info: UserInfo = { PK_Id: idx >= 0 ? MOCK_USER_INFO[idx].PK_Id : nextId(MOCK_USER_INFO, 'PK_Id'), FK_user_id: userId, ...data } as UserInfo;
    if (idx >= 0) MOCK_USER_INFO[idx] = info; else MOCK_USER_INFO.push(info);
    return info;
  },
};

/* ── Assignments (legacy) ── */
export const assignmentsApi = {
  getAll: () => apiFetch<TaskAssignment[]>('/api/assignments', MOCK_ASSIGNMENTS),
  getByChild: (childId: number) => apiFetch<TaskAssignment[]>(`/api/children/${childId}/assignments`, MOCK_ASSIGNMENTS.filter(a => a.FK_ChildId === childId)),
  create: async (data: Partial<TaskAssignment>): Promise<TaskAssignment | null> => {
    const r = await apiPost<TaskAssignment>('/api/assignments', data); if (r) return r;
    const a: TaskAssignment = { PK_AssignmentId: nextId(MOCK_ASSIGNMENTS, 'PK_AssignmentId'), FK_TaskId: data.FK_TaskId || 0, FK_ChildId: data.FK_ChildId || 0, AssignedDate: new Date().toISOString(), Status: 'pending', ...data } as TaskAssignment;
    MOCK_ASSIGNMENTS.push(a); return a;
  },
  updateStatus: async (id: number, status: TaskAssignment['Status']) => {
    const a = MOCK_ASSIGNMENTS.find(x => x.PK_AssignmentId === id);
    if (a) a.Status = status;
    return a || null;
  },
};

/* ── Progress ── */
export const progressApi = {
  getAll: () => apiFetch<ProgressRecord[]>('/api/progress', MOCK_PROGRESS),
  getByChild: (childId: number) => apiFetch<ProgressRecord[]>(`/api/children/${childId}/progress`, MOCK_PROGRESS.filter(p => p.FK_ChildId === childId)),
  create: async (data: Partial<ProgressRecord>): Promise<ProgressRecord | null> => {
    const r = await apiPost<ProgressRecord>('/api/progress', data); if (r) return r;
    const p: ProgressRecord = { PK_ProgressId: nextId(MOCK_PROGRESS, 'PK_ProgressId'), FK_AssignmentId: data.FK_AssignmentId || 0, FK_ChildId: data.FK_ChildId || 0, CompletedDate: new Date().toISOString(), ErrorCount: data.ErrorCount || 0, HintsUsed: data.HintsUsed || 0, IsCorrect: data.IsCorrect ?? false, ...data } as ProgressRecord;
    MOCK_PROGRESS.push(p); return p;
  },
};

/* ── Rewards (легаси) ── */
export const rewardsApi = {
  getByChild: (childId: number) => apiFetch<Reward[]>(`/api/children/${childId}/rewards`, MOCK_REWARDS.filter(r => r.FK_ChildId === childId)),
};

/* ── Trajectories (легаси) ── */
export const trajectoriesApi = {
  getAll: () => apiFetch<LearningTrajectory[]>('/api/trajectories', MOCK_TRAJECTORIES),
  getSteps: (id: number) => apiFetch<TrajectoryStep[]>(`/api/trajectories/${id}/steps`, MOCK_TRAJECTORY_STEPS.filter(s => s.FK_TrajectoryId === id)),
  create: async (data: Partial<LearningTrajectory>): Promise<LearningTrajectory | null> => {
    const r = await apiPost<LearningTrajectory>('/api/trajectories', data); if (r) return r;
    const t: LearningTrajectory = { PK_TrajectoryId: nextId(MOCK_TRAJECTORIES, 'PK_TrajectoryId'), TrajectoryName: data.TrajectoryName || '', FK_EducatorId: data.FK_EducatorId || 0, ...data } as LearningTrajectory;
    MOCK_TRAJECTORIES.push(t); return t;
  },
};

/* ── Groups ── */
export const groupsApi = {
  getAll: () => apiFetch<ChildGroup[]>('/api/groups', MOCK_GROUPS),
  getByEducator: (educatorId: number) => apiFetch<ChildGroup[]>(`/api/educators/${educatorId}/groups`, MOCK_GROUPS.filter(g => g.FK_EducatorId === educatorId)),
  getMembers: (groupId: number) => apiFetch<ChildGroupMember[]>(`/api/groups/${groupId}/members`, MOCK_GROUP_MEMBERS.filter(m => m.FK_GroupId === groupId)),
  create: async (data: Partial<ChildGroup>): Promise<ChildGroup | null> => {
    const r = await apiPost<ChildGroup>('/api/groups', data); if (r) return r;
    const g: ChildGroup = { PK_GroupId: nextId(MOCK_GROUPS, 'PK_GroupId'), GroupName: data.GroupName || '', FK_EducatorId: data.FK_EducatorId || 0, ...data } as ChildGroup;
    MOCK_GROUPS.push(g); return g;
  },
  delete: async (id: number) => {
    const idx = MOCK_GROUPS.findIndex(g => g.PK_GroupId === id);
    if (idx >= 0) { MOCK_GROUPS.splice(idx, 1);
      for (let i = MOCK_GROUP_MEMBERS.length - 1; i >= 0; i--) if (MOCK_GROUP_MEMBERS[i].FK_GroupId === id) MOCK_GROUP_MEMBERS.splice(i, 1);
      return true;
    }
    return false;
  },
  addMember: async (groupId: number, childId: number) => {
    const r = await apiPost<ChildGroupMember>(`/api/groups/${groupId}/members`, { childId });
    if (r) return r;
    const exists = MOCK_GROUP_MEMBERS.find(m => m.FK_GroupId === groupId && m.FK_ChildId === childId);
    if (exists) return exists;
    const m: ChildGroupMember = { PK_MemberId: nextId(MOCK_GROUP_MEMBERS, 'PK_MemberId'), FK_GroupId: groupId, FK_ChildId: childId };
    MOCK_GROUP_MEMBERS.push(m); return m;
  },
  removeMember: async (memberId: number) => {
    const idx = MOCK_GROUP_MEMBERS.findIndex(m => m.PK_MemberId === memberId);
    if (idx >= 0) { MOCK_GROUP_MEMBERS.splice(idx, 1); return true; }
    return false;
  },
};

/* ── Achievements ── */
export const achievementsApi = {
  getAll: () => apiFetch<Achievement[]>('/api/achievements', MOCK_ACHIEVEMENTS),
  getByUser: (userId: number) => apiFetch<UserAchievement[]>(`/api/users/${userId}/achievements`, MOCK_USER_ACHIEVEMENTS.filter(a => a.user_id === userId)),
  award: async (userId: number, achievementId: number): Promise<UserAchievement | null> => {
    const exists = MOCK_USER_ACHIEVEMENTS.find(a => a.user_id === userId && a.achivement_id === achievementId);
    if (exists) return exists;
    const a: UserAchievement = { id: nextId(MOCK_USER_ACHIEVEMENTS, 'id'), user_id: userId, achivement_id: achievementId, earned_date: new Date().toISOString() };
    MOCK_USER_ACHIEVEMENTS.push(a); return a;
  },
};

/* ── Task Lists (цепочки) ── */
export const taskListsApi = {
  getAll: () => apiFetch<TaskList[]>('/api/task-lists', MOCK_TASK_LISTS),
  getByTeacher: (teacherId: number) => apiFetch<TaskList[]>(`/api/teachers/${teacherId}/task-lists`, MOCK_TASK_LISTS.filter(l => l.teacher_id === teacherId)),
  getByUser: (userId: number) => {
    const listIds = [...new Set(MOCK_TASK_LIST_ITEMS.filter(i => i.user_id === userId).map(i => i.task_list_id))];
    return apiFetch<TaskList[]>(`/api/users/${userId}/task-lists`, MOCK_TASK_LISTS.filter(l => listIds.includes(l.PK_id)));
  },
  getItems: (listId: number) => apiFetch<TaskListItem[]>(`/api/task-lists/${listId}/items`, MOCK_TASK_LIST_ITEMS.filter(i => i.task_list_id === listId)),
  getItemsForUser: (listId: number, userId: number) =>
    apiFetch<TaskListItem[]>(`/api/task-lists/${listId}/items?user=${userId}`,
      MOCK_TASK_LIST_ITEMS.filter(i => i.task_list_id === listId && i.user_id === userId).sort((a, b) => a.position - b.position)),

  create: async (data: { Title: string; Descripti?: string; teacher_id: number; date_complite?: string; taskIds: number[]; userIds: number[] }): Promise<TaskList | null> => {
    const r = await apiPost<TaskList>('/api/task-lists', data); if (r) return r;
    const list: TaskList = {
      PK_id: nextId(MOCK_TASK_LISTS, 'PK_id'),
      Title: data.Title, Descripti: data.Descripti,
      teacher_id: data.teacher_id, date_complite: data.date_complite,
    };
    MOCK_TASK_LISTS.push(list);
    // создаём элементы для каждого ребёнка × задачи
    let nid = nextId(MOCK_TASK_LIST_ITEMS, 'id');
    data.userIds.forEach(uid => {
      data.taskIds.forEach((tid, pos) => {
        MOCK_TASK_LIST_ITEMS.push({ id: nid++, task_id: tid, task_list_id: list.PK_id, position: pos + 1, user_id: uid, complited: false });
      });
    });
    return list;
  },

  markCompleted: async (itemId: number) => {
    const it = MOCK_TASK_LIST_ITEMS.find(i => i.id === itemId);
    if (it) it.complited = true;
    return it || null;
  },

  /** Помечает выполненными все элементы цепочек данного пользователя по taskId. */
  markTaskCompletedForUser: async (taskId: number, userId: number) => {
    const updated = MOCK_TASK_LIST_ITEMS.filter(i => i.task_id === taskId && i.user_id === userId && !i.complited);
    updated.forEach(i => { i.complited = true; });
    return updated;
  },

  /** Возвращает статусы цепочек пользователя: { listId: { total, done, isDone } }. */
  getStatusesForUser: async (userId: number) => {
    const map: Record<number, { total: number; done: number; isDone: boolean }> = {};
    MOCK_TASK_LIST_ITEMS.filter(i => i.user_id === userId).forEach(i => {
      if (!map[i.task_list_id]) map[i.task_list_id] = { total: 0, done: 0, isDone: false };
      map[i.task_list_id].total++;
      if (i.complited) map[i.task_list_id].done++;
    });
    Object.values(map).forEach(s => { s.isDone = s.total > 0 && s.done === s.total; });
    return map;
  },

  /**
   * Возвращает следующее по позиции задание в цепочке для конкретного пользователя.
   * Учитывает: тот же task_list, position > текущей, ещё не выполнено.
   * Возвращает { listId, nextTaskId, position } либо null.
   */
  getNextInChainsForUser: async (currentTaskId: number, userId: number) => {
    // Все цепочки пользователя, где встречается текущее задание
    const myItems = MOCK_TASK_LIST_ITEMS.filter(i => i.user_id === userId);
    const currents = myItems.filter(i => i.task_id === currentTaskId);
    for (const cur of currents) {
      const next = myItems
        .filter(i => i.task_list_id === cur.task_list_id && i.position > cur.position)
        .sort((a, b) => a.position - b.position)[0];
      if (next) {
        return { listId: cur.task_list_id, nextTaskId: next.task_id, position: next.position };
      }
    }
    return null;
  },

  delete: async (listId: number) => {
    const idx = MOCK_TASK_LISTS.findIndex(l => l.PK_id === listId);
    if (idx >= 0) { MOCK_TASK_LISTS.splice(idx, 1);
      for (let i = MOCK_TASK_LIST_ITEMS.length - 1; i >= 0; i--) if (MOCK_TASK_LIST_ITEMS[i].task_list_id === listId) MOCK_TASK_LIST_ITEMS.splice(i, 1);
      return true;
    }
    return false;
  },
};
