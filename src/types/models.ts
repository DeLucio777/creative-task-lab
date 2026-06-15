/* ─── Роли ─── */
export type AppRole = 'admin' | 'educator' | 'parent';
export interface Role {
  PK_RoleId: number;
  RoleName?: string;
  RoleKey?: AppRole;
}

/* ─── tbl_User ─── */
export interface User {
  PK_UserId: number;
  UserLogin: string;
  UserPassword?: string;
  FK_RoleId?: number;
  first_name?: string;
  second_name?: string;
  phone?: string;
  email?: string;
  Role?: Role;
}

/* ─── tbl_disease ─── */
export interface Disease {
  PK_Id: number;
  name?: string;
}

/* ─── tbl_childInfo ─── */
export interface ChildInfo {
  PK_Id: number;
  FK_user_id: number;
  FK_disease_id?: number;
  complited_tasks_count?: number;
  helpe_used_count?: number;
  miss_tasks_count?: number;
  age?: number;
  speak_level?: string;
}

/* ─── tbl_teacherInfo ─── */
export interface TeacherInfo {
  PK_Id: number;
  FK_UserId: number;
  Teacher_Specialization?: string;
}

/* ─── UI-удобные обёртки (производные от User+childInfo/teacherInfo) ─── */
export interface Educator {
  PK_EducatorId: number;   // = User.PK_UserId
  FK_UserId: number;
  FullName: string;
  Specialization?: string;
  Phone?: string;
  Email?: string;
}

export interface Child {
  PK_ChildId: number;      // = User.PK_UserId
  FullName: string;
  age?: number;
  speak_level?: string;
  FK_disease_id?: number;
  email?: string;
  phone?: string;
}

/* ─── Медиа ─── */
export interface MediaCatalog {
  PK_MediaId: number;
  FileType: string;
  FilePath: string;
  Descripti?: string;
  UploadDate?: string;
}
export interface CatalogPECS {
  PK_PECSid: number;
  Descripti?: string;
  filePath: string;
  Category: string;
  UploadDate?: string;
}

/* ─── Задания ─── */
export interface TaskTemplate {
  PK_TemplateId: number;
  TemplateName: string;
  Descripti?: string;
}

export interface Task {
  PK_TaskId: number;
  Title: string;
  Descripti?: string;
  FK_TemplateId: number;
  FK_UserId: number;
  DifficultyLevel?: 'Easy' | 'Medium' | 'Hard';
  UploadDate?: string;
  public_task?: boolean;
  Template?: TaskTemplate;
  User?: User;
}

export interface TaskConstruction {
  PK_ConstructionId: number;
  FK_TaskId: number;
  ParameterName: string;
  ParameterValue: string;
  Help?: string;
}

export interface FindOddOneOutItem {
  PK_ItemId: number;
  FK_TaskId: number;
  ItemText: string;
  IsOddOne: boolean;
  FK_pecsId?: number;
  Help?: string;
}
export interface MatchImageWordPair {
  PK_PairId: number;
  FK_TaskId: number;
  FK_MediaId: number;
  FK_pecsId?: number;
  Words: string;
  Help?: string;
}
export interface SequenceItem {
  PK_SeqItemId: number;
  FK_TaskId: number;
  ItemOrder: number;
  ItemValue: string;
  FK_pecsId?: number;
  Help?: string;
}
export interface SortItem {
  PK_SortItemId: number;
  FK_TaskId: number;
  ItemValue: string;
  SortKey: string;
  FK_pecsId?: number;
}

/* ─── Группы ─── */
export interface ChildGroup {
  PK_Id: number;
  FK_Teacher_id: number;
  GroupName?: string;
}
export interface ChildGroupMember {
  PK_Id: number;
  FK_user_id: number;
  FK_group_id: number;
}

/* ─── Цепочки заданий ─── */
export interface TaskList {
  PK_id: number;
  date_complite?: string;
  teacher_id: number;
  Title?: string;
  Descripti?: string;
  FK_achievement_id?: number;
}
export interface TaskListItem {
  id: number;
  task_id: number;
  task_list_id: number;
  position: number;
  user_id: number;
  complited: boolean;
}

/* ─── Прогресс (легаси) ─── */
export interface ProgressRecord {
  PK_ProgressId: number;
  FK_AssignmentId?: number;
  FK_ChildId: number;
  CompletedDate: string;
  ErrorCount: number;
  HintsUsed: number;
  TimeTakenSeconds?: number;
  IsCorrect: boolean;
}

/* ─── Достижения ─── */
export interface Achievement {
  id: number;
  name?: string;
  description?: string;
  image_id?: number;
  created_by?: number;
}
export interface UserAchievement {
  id: number;
  achivement_id: number;
  user_id: number;
  earned_date?: string;
}
