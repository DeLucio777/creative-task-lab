/* ── Роли ── */

export type AppRole = 'admin' | 'educator' | 'parent';

export interface Role {
  PK_RoleId: number;
  RoleName?: string;
  RoleKey?: AppRole;
}

/* ── Пользователь (tbl_User) ── */
export interface User {
  PK_UserId: number;
  UserLogin: string;
  UserPassword: string;
  FK_RoleId?: number;
  first_name?: string;
  second_name?: string;
  phone?: string;
  Role?: Role;
}

/* ── Заболевания (tbl_disease) ── */
export interface Disease {
  PK_Id: number;
  name: string;
}

/* ── Доп. информация о пользователе-ребёнке (tbl_user_info) ── */
export interface UserInfo {
  PK_Id: number;
  FK_user_id: number;        // ссылка на tbl_User (роль = ребёнок/представитель)
  FK_disease_id?: number;
  complited_tasks_count?: number;
  helpe_used_count?: number;
  miss_tasks_count?: number;
  age?: number;
  /* Расширения для сенсорного профиля и особенностей */
  PerceptionFeatures?: string;
  SpeechLevel?: string;
  BackgroundColor?: string;
  FontSize?: number;
  ExcludeLoudSounds?: boolean;
  RewardAnimation?: string;
  /* Связь представитель↔ребёнок */
  FK_RepresentativeUserId?: number;
  FK_EducatorUserId?: number;
}

/* ── Совместимость со старыми именами (UI ещё использует Educator/LegalRep/Child) ── */
export interface Educator {
  PK_EducatorId: number;
  FK_UserId: number;
  FullName: string;
  Specialization?: string;
  Phone?: string;
  Email?: string;
  User?: User;
}

export interface LegalRepresentative {
  PK_RepresentativeId: number;
  FK_UserId: number;
  FullName: string;
  RelationType?: string;
  Phone?: string;
  Email?: string;
  User?: User;
}

export interface Child {
  PK_ChildId: number;
  FullName: string;
  BirthDate?: string;
  PerceptionFeatures?: string;
  SpeechLevel?: string;
  FK_RepresentativeId?: number;
  FK_EducatorId?: number;
  Representative?: LegalRepresentative;
  Educator?: Educator;
  RegisteredDate?: string;
}

export interface SensoryProfile {
  PK_ProfileId: number;
  FK_ChildId: number;
  BackgroundColor?: string;
  FontSize?: number;
  ExcludeLoudSounds?: boolean;
  RewardAnimation?: string;
}

/* ── Медиа ── */
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

/* ── Шаблоны и задания ── */
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
  FK_UserId: number;          // автор (педагог)
  DifficultyLevel?: 'Easy' | 'Medium' | 'Hard';
  UploadDate?: string;        // tbl_Task.UploadDate (date)
  CreatedDate?: string;       // alias для совместимости с отчётами
  IsPublished?: boolean;      // tbl_Task.public
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

/* ── Группы (tbl_group + tbl_childrent_to_groups) ── */
export interface ChildGroup {
  PK_GroupId: number;
  GroupName: string;
  FK_EducatorId: number;     // teacher user id
  Educator?: Educator;
}

export interface ChildGroupMember {
  PK_MemberId: number;
  FK_GroupId: number;
  FK_ChildId: number;
}

/* ── Цепочки заданий (tbl_task_list + tbl_task_lst_to_data) ── */
export interface TaskList {
  PK_id: number;
  Title: string;                  // расширение для UI
  Descripti?: string;
  date_complite?: string;         // дедлайн
  teacher_id: number;             // FK_User
}

export interface TaskListItem {
  id: number;
  task_id: number;
  task_list_id: number;
  position: number;
  user_id: number;                // ребёнок (FK_User), которому назначена цепочка
  complited: boolean;
}

/* ── Назначения (старая модель, оставлена для совместимости) ── */
export interface TaskAssignment {
  PK_AssignmentId: number;
  FK_TaskId: number;
  FK_ChildId: number;
  AssignedDate: string;
  DueDate?: string;
  Status: 'pending' | 'in_progress' | 'completed';
  Task?: Task;
  Child?: Child;
}

/* ── Прогресс ── */
export interface ProgressRecord {
  PK_ProgressId: number;
  FK_AssignmentId: number;
  FK_ChildId: number;
  CompletedDate: string;
  ErrorCount: number;
  HintsUsed: number;
  TimeTakenSeconds?: number;
  IsCorrect: boolean;
}

/* ── Достижения (tbl_achievement + tbl_users_achievement) ── */
export interface Achievement {
  id: number;
  name: string;
  description?: string;
  image_id?: number;             // FK_MediaId
}

export interface UserAchievement {
  id: number;
  achivement_id: number;
  user_id: number;
  earned_date?: string;
}

/* ── Поощрения (легаси) ── */
export interface Reward {
  PK_RewardId: number;
  FK_ChildId: number;
  RewardType: string;
  RewardValue: string;
  EarnedDate: string;
}

/* ── Траектория обучения (легаси) ── */
export interface LearningTrajectory {
  PK_TrajectoryId: number;
  TrajectoryName: string;
  FK_EducatorId: number;
  Descripti?: string;
}

export interface TrajectoryStep {
  PK_StepId: number;
  FK_TrajectoryId: number;
  FK_TaskId: number;
  StepOrder: number;
}
