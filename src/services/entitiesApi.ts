import type {
  Child, Educator, ChildInfo, TeacherInfo,
  ProgressRecord, ChildGroup, ChildGroupMember,
  Disease, Achievement, UserAchievement,
  TaskList, TaskListItem, User,
} from '@/types/models';
import { apiGet, apiPost, apiPut, apiDelete, safe } from './apiClient';

/* ─── Роли ─── */
export const ROLE_ID = { admin: 3, educator: 2, parent: 1 } as const;

/* ─── Helpers ─── */
const fullNameOf = (u: User): string => {
  const fio = [u.second_name, u.first_name].filter(Boolean).join(' ').trim();
  return fio || u.UserLogin;
};
export const splitFullName = (fio: string): { first_name?: string; second_name?: string } => {
  const parts = fio.trim().split(/\s+/);
  return { second_name: parts[0], first_name: parts.slice(1).join(' ') || undefined };
};

/* ─── Users ─── */
export const usersApi = {
  getAll: (): Promise<User[]> => safe(apiGet<User[]>('/api/users'), []),
  getById: (id: number): Promise<User | null> => safe(apiGet<User>(`/api/users/${id}`), null),
  update: (id: number, data: Partial<User>): Promise<User | null> =>
    safe(apiPut<User>(`/api/users/${id}`, data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/users/${id}`); return true; } catch { return false; }
  },
  isLoginTaken: async (login: string): Promise<boolean> => {
    const all = await safe(apiGet<User[]>('/api/users'), [] as User[]);
    const n = login.trim().toLowerCase();
    return all.some(u => (u.UserLogin || '').toLowerCase() === n);
  },
};

/* ─── Educators (производные от users где role=2) ─── */
const userToEducator = (u: User, infos: TeacherInfo[]): Educator => {
  const info = infos.find(i => i.FK_UserId === u.PK_UserId);
  return {
    PK_EducatorId: u.PK_UserId,
    FK_UserId: u.PK_UserId,
    FullName: fullNameOf(u),
    Specialization: info?.Teacher_Specialization,
    Phone: u.phone,
    Email: u.email,
  };
};

export const teacherInfoApi = {
  getAll: (): Promise<TeacherInfo[]> => safe(apiGet<TeacherInfo[]>('/api/teacher-info'), []),
  save: (userId: number, data: Partial<TeacherInfo>): Promise<TeacherInfo | null> =>
    safe(apiPost<TeacherInfo>('/api/teacher-info', { ...data, FK_UserId: userId }), null),
};

export const educatorsApi = {
  getAll: async (): Promise<Educator[]> => {
    const [users, infos] = await Promise.all([usersApi.getAll(), teacherInfoApi.getAll()]);
    return users.filter(u => u.FK_RoleId === ROLE_ID.educator).map(u => userToEducator(u, infos));
  },
  getByUserId: async (userId: number): Promise<Educator | null> => {
    const [u, infos] = await Promise.all([usersApi.getById(userId), teacherInfoApi.getAll()]);
    return u && u.FK_RoleId === ROLE_ID.educator ? userToEducator(u, infos) : null;
  },
  update: async (id: number, data: Partial<Educator>): Promise<Educator | null> => {
    const patch: Partial<User> = {};
    if (data.FullName !== undefined) Object.assign(patch, splitFullName(data.FullName));
    if (data.Phone !== undefined) patch.phone = data.Phone;
    if (data.Email !== undefined) patch.email = data.Email;
    const u = await usersApi.update(id, patch);
    if (data.Specialization !== undefined) await teacherInfoApi.save(id, { Teacher_Specialization: data.Specialization });
    const infos = await teacherInfoApi.getAll();
    return u ? userToEducator(u, infos) : null;
  },
  delete: (id: number): Promise<boolean> => usersApi.delete(id),
};

/* ─── ChildInfo ─── */
export const childInfoApi = {
  getAll: (): Promise<ChildInfo[]> => safe(apiGet<ChildInfo[]>('/api/child-info'), []),
  save: (userId: number, data: Partial<ChildInfo>): Promise<ChildInfo | null> =>
    safe(apiPost<ChildInfo>('/api/child-info', { ...data, FK_user_id: userId }), null),
};

/* ─── Children (производные от users где role=1) ─── */
const userToChild = (u: User, infos: ChildInfo[]): Child => {
  const info = infos.find(i => i.FK_user_id === u.PK_UserId);
  return {
    PK_ChildId: u.PK_UserId,
    FullName: fullNameOf(u),
    age: info?.age,
    speak_level: info?.speak_level,
    FK_disease_id: info?.FK_disease_id,
    email: u.email,
    phone: u.phone,
  };
};

export const childrenApi = {
  getAll: async (): Promise<Child[]> => {
    const [users, infos] = await Promise.all([usersApi.getAll(), childInfoApi.getAll()]);
    return users.filter(u => u.FK_RoleId === ROLE_ID.parent).map(u => userToChild(u, infos));
  },
  getById: async (id: number): Promise<Child | null> => {
    const [u, infos] = await Promise.all([usersApi.getById(id), childInfoApi.getAll()]);
    return u && u.FK_RoleId === ROLE_ID.parent ? userToChild(u, infos) : null;
  },
  /** Возвращает детей, входящих в группы данного педагога. */
  getByEducator: async (teacherUserId: number): Promise<Child[]> => {
    const [users, infos, groups, members] = await Promise.all([
      usersApi.getAll(), childInfoApi.getAll(), groupsApi.getAll(), groupsApi.getAllMembers(),
    ]);
    const myGroupIds = new Set(groups.filter(g => g.FK_Teacher_id === teacherUserId).map(g => g.PK_Id));
    const myChildIds = new Set(members.filter(m => myGroupIds.has(m.FK_group_id)).map(m => m.FK_user_id));
    return users.filter(u => u.FK_RoleId === ROLE_ID.parent && myChildIds.has(u.PK_UserId))
                .map(u => userToChild(u, infos));
  },
  update: async (id: number, patch: Partial<Child>): Promise<Child | null> => {
    const userPatch: Partial<User> = {};
    if (patch.FullName !== undefined) Object.assign(userPatch, splitFullName(patch.FullName));
    if (patch.email !== undefined) userPatch.email = patch.email;
    if (patch.phone !== undefined) userPatch.phone = patch.phone;
    if (Object.keys(userPatch).length) await usersApi.update(id, userPatch);

    const infoPatch: Partial<ChildInfo> = {};
    if (patch.age !== undefined) infoPatch.age = patch.age;
    if (patch.speak_level !== undefined) infoPatch.speak_level = patch.speak_level;
    if (patch.FK_disease_id !== undefined) infoPatch.FK_disease_id = patch.FK_disease_id;
    if (Object.keys(infoPatch).length) await childInfoApi.save(id, infoPatch);

    return childrenApi.getById(id);
  },
  delete: (id: number): Promise<boolean> => usersApi.delete(id),
};

/* ─── Diseases ─── */
export const diseasesApi = {
  getAll: (): Promise<Disease[]> => safe(apiGet<Disease[]>('/api/diseases'), []),
};

/* ─── Groups ─── */
export const groupsApi = {
  getAll: (): Promise<ChildGroup[]> => safe(apiGet<ChildGroup[]>('/api/groups'), []),
  getAllMembers: (): Promise<ChildGroupMember[]> =>
    safe(apiGet<ChildGroupMember[]>('/api/group-members'), []),
  getByEducator: async (teacherUserId: number): Promise<ChildGroup[]> => {
    const all = await groupsApi.getAll();
    return all.filter(g => g.FK_Teacher_id === teacherUserId);
  },
  getMembers: async (groupId: number): Promise<ChildGroupMember[]> => {
    const all = await groupsApi.getAllMembers();
    return all.filter(m => m.FK_group_id === groupId);
  },
  create: (data: Partial<ChildGroup>): Promise<ChildGroup | null> =>
    safe(apiPost<ChildGroup>('/api/groups', data), null),
  update: (id: number, data: Partial<ChildGroup>): Promise<ChildGroup | null> =>
    safe(apiPut<ChildGroup>(`/api/groups/${id}`, data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/groups/${id}`); return true; } catch { return false; }
  },
  addMember: (groupId: number, userId: number): Promise<ChildGroupMember | null> =>
    safe(apiPost<ChildGroupMember>('/api/group-members', { FK_group_id: groupId, FK_user_id: userId }), null),
  removeMember: async (memberId: number): Promise<boolean> => {
    try { await apiDelete(`/api/group-members/${memberId}`); return true; } catch { return false; }
  },
};

/* ─── Progress (легаси) ─── */
export const progressApi = {
  getAll: (): Promise<ProgressRecord[]> => safe(apiGet<ProgressRecord[]>('/api/progress'), []),
  getByChild: async (childId: number): Promise<ProgressRecord[]> => {
    const all = await progressApi.getAll();
    return all.filter(p => p.user_id === childId);
  },
  create: (data: Partial<ProgressRecord>): Promise<ProgressRecord | null> =>
    safe(apiPost<ProgressRecord>('/api/progress', data), null),
};

/* ─── Achievements ─── */
export const achievementsApi = {
  getAll: (): Promise<Achievement[]> => safe(apiGet<Achievement[]>('/api/achievements'), []),
  create: (data: Partial<Achievement>): Promise<Achievement | null> =>
    safe(apiPost<Achievement>('/api/achievements', data), null),
  update: (id: number, data: Partial<Achievement>): Promise<Achievement | null> =>
    safe(apiPut<Achievement>(`/api/achievements/${id}`, data), null),
  delete: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/achievements/${id}`); return true; } catch { return false; }
  },
  getAllUserAchievements: (): Promise<UserAchievement[]> =>
    safe(apiGet<UserAchievement[]>('/api/user-achievements'), []),
  getByUser: async (userId: number): Promise<UserAchievement[]> => {
    const all = await achievementsApi.getAllUserAchievements();
    return all.filter(ua => ua.user_id === userId);
  },
  award: (userId: number, achievementId: number): Promise<UserAchievement | null> =>
    safe(apiPost<UserAchievement>('/api/user-achievements', { user_id: userId, achivement_id: achievementId }), null),
};

/* ─── Task lists ─── */
export interface TaskListCreate {
  Title: string;
  Descripti?: string;
  teacher_id: number;
  date_complite?: string;
  FK_achievement_id?: number;
  taskIds: number[];
  userIds: number[];
}
export interface TaskListStatus { total: number; done: number; isDone: boolean }
export interface NextInChain { listId: number; nextTaskId: number; position: number }

export const taskListsApi = {
  getAll: (): Promise<TaskList[]> => safe(apiGet<TaskList[]>('/api/task-lists'), []),
  getAllItems: (): Promise<TaskListItem[]> => safe(apiGet<TaskListItem[]>('/api/task-list-items'), []),
  getByTeacher: async (teacherId: number): Promise<TaskList[]> => {
    const all = await taskListsApi.getAll();
    return all.filter(l => l.teacher_id === teacherId);
  },
  getByUser: async (userId: number): Promise<TaskList[]> => {
    const [lists, items] = await Promise.all([taskListsApi.getAll(), taskListsApi.getAllItems()]);
    const myListIds = new Set(items.filter(i => i.user_id === userId).map(i => i.task_list_id));
    return lists.filter(l => myListIds.has(l.PK_id));
  },
  getItems: async (listId: number): Promise<TaskListItem[]> => {
    const all = await taskListsApi.getAllItems();
    return all.filter(i => i.task_list_id === listId);
  },
  getItemsForUser: async (listId: number, userId: number): Promise<TaskListItem[]> => {
    const all = await taskListsApi.getAllItems();
    return all.filter(i => i.task_list_id === listId && i.user_id === userId);
  },
  create: (data: TaskListCreate): Promise<TaskList | null> =>
    safe(apiPost<TaskList>('/api/task-lists', data), null),
  markCompleted: (itemId: number): Promise<TaskListItem | null> =>
    safe(apiPut<TaskListItem>(`/api/task-list-items/${itemId}/complete`, {}), null),
  /**
   * Помечает все пункты для пары (taskId, userId) выполненными
   * через `PUT /api/task-list-items/:id/complete` (актуальный backend route).
   */
  markTaskCompletedForUser: async (taskId: number, userId: number): Promise<TaskListItem[]> => {
    const all = await taskListsApi.getAllItems();
    const targets = all.filter(i => i.task_id === taskId && i.user_id === userId && !i.complited);
    const updated: TaskListItem[] = [];
    for (const it of targets) {
      const r = await taskListsApi.markCompleted(it.id);
      if (r) updated.push(r);
    }
    return updated;
  },
  getStatusesForUser: async (userId: number): Promise<Record<number, TaskListStatus>> => {
    const items = (await taskListsApi.getAllItems()).filter(i => i.user_id === userId);
    const acc: Record<number, TaskListStatus> = {};
    for (const it of items) {
      const s = acc[it.task_list_id] ?? { total: 0, done: 0, isDone: false };
      s.total++;
      if (it.complited) s.done++;
      acc[it.task_list_id] = s;
    }
    Object.values(acc).forEach(s => { s.isDone = s.total > 0 && s.done === s.total; });
    return acc;
  },
  getNextInChainsForUser: async (currentTaskId: number, userId: number): Promise<NextInChain | null> => {
    const items = (await taskListsApi.getAllItems())
      .filter(i => i.user_id === userId)
      .sort((a, b) => a.position - b.position);
    const byList = new Map<number, TaskListItem[]>();
    items.forEach(i => {
      const arr = byList.get(i.task_list_id) ?? [];
      arr.push(i); byList.set(i.task_list_id, arr);
    });
    for (const [listId, arr] of byList) {
      const idx = arr.findIndex(i => i.task_id === currentTaskId);
      if (idx >= 0) {
        const next = arr.slice(idx + 1).find(x => !x.complited);
        if (next) return { listId, nextTaskId: next.task_id, position: next.position };
      }
    }
    return null;
  },
  /**
   * Проверяет, какие цепочки только что завершились для пользователя,
   * и автоматически выдаёт привязанные к ним достижения.
   * Возвращает выданные достижения (для отображения «🏆 Получено!»).
   */
  awardForCompletedChains: async (userId: number): Promise<Achievement[]> => {
    const [lists, statuses, ach, userAch] = await Promise.all([
      taskListsApi.getAll(),
      taskListsApi.getStatusesForUser(userId),
      achievementsApi.getAll(),
      achievementsApi.getByUser(userId),
    ]);
    const earned = new Set(userAch.map(u => u.achivement_id));
    const awarded: Achievement[] = [];
    for (const list of lists) {
      if (!list.FK_achievement_id) continue;
      if (!statuses[list.PK_id]?.isDone) continue;
      if (earned.has(list.FK_achievement_id)) continue;
      const r = await achievementsApi.award(userId, list.FK_achievement_id);
      if (r) {
        const a = ach.find(x => x.id === list.FK_achievement_id);
        if (a) awarded.push(a);
      }
    }
    return awarded;
  },
  delete: async (listId: number): Promise<boolean> => {
    try { await apiDelete(`/api/task-lists/${listId}`); return true; } catch { return false; }
  },
};
