/* ── Справочники ── */

export type AppRole = 'admin' | 'educator' | 'parent';

export interface Role {
  PK_RoleId: number;
  RoleName?: string;
  RoleKey?: AppRole;
}

export interface User {
  PK_UserId: number;
  UserLogin: string;
  UserPassword: string;
  FK_RoleId?: number;
  Role?: Role;
}

/* ── Участники ── */

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
  RelationType?: string; // мать, отец, опекун
  Phone?: string;
  Email?: string;
  User?: User;
}

export interface Child {
  PK_ChildId: number;
  FullName: string;
  BirthDate?: string;
  PerceptionFeatures?: string;   // особенности восприятия
  SpeechLevel?: string;          // уровень речевого развития
  FK_RepresentativeId?: number;
  FK_EducatorId?: number;
  Representative?: LegalRepresentative;
  Educator?: Educator;
}

export interface SensoryProfile {
  PK_ProfileId: number;
  FK_ChildId: number;
  BackgroundColor?: string;
  FontSize?: number;
  ExcludeLoudSounds?: boolean;
  RewardAnimation?: string;
  Child?: Child;
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
  FK_UserId: number;
  DifficultyLevel?: 'Easy' | 'Medium' | 'Hard';
  CreatedDate?: string;
  IsPublished?: boolean;
  Template?: TaskTemplate;
  User?: User;
}

export interface TaskConstruction {
  PK_ConstructionId: number;
  FK_TaskId: number;
  ParameterName: string;
  ParameterValue: string;
  Task?: Task;
}

export interface FindOddOneOutItem {
  PK_ItemId: number;
  FK_TaskId: number;
  ItemText: string;
  IsOddOne: boolean;
  FK_pecsId?: number;
  Task?: Task;
  PECS?: CatalogPECS;
}

export interface MatchImageWordPair {
  PK_PairId: number;
  FK_TaskId: number;
  FK_MediaId: number;
  FK_pecsId?: number;
  Words: string;
  Task?: Task;
  Media?: MediaCatalog;
  PECS?: CatalogPECS;
}

export interface SequenceItem {
  PK_SeqItemId: number;
  FK_TaskId: number;
  ItemOrder: number;
  ItemValue: string;
  FK_pecsId?: number;
  Task?: Task;
  PECS?: CatalogPECS;
}

export interface SortItem {
  PK_SortItemId: number;
  FK_TaskId: number;
  ItemValue: string;
  SortKey: string;
  FK_pecsId?: number;
  Task?: Task;
  PECS?: CatalogPECS;
}

/* ── Назначение заданий ── */

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

/* ── Прогресс и история ── */

export interface ProgressRecord {
  PK_ProgressId: number;
  FK_AssignmentId: number;
  FK_ChildId: number;
  CompletedDate: string;
  ErrorCount: number;
  HintsUsed: number;
  TimeTakenSeconds?: number;
  IsCorrect: boolean;
  Assignment?: TaskAssignment;
  Child?: Child;
}

/* ── Поощрения ── */

export interface Reward {
  PK_RewardId: number;
  FK_ChildId: number;
  RewardType: string; // badge, star, animation
  RewardValue: string;
  EarnedDate: string;
  Child?: Child;
}

/* ── Траектория обучения (цепочки заданий) ── */

export interface LearningTrajectory {
  PK_TrajectoryId: number;
  TrajectoryName: string;
  FK_EducatorId: number;
  Descripti?: string;
  Educator?: Educator;
}

export interface TrajectoryStep {
  PK_StepId: number;
  FK_TrajectoryId: number;
  FK_TaskId: number;
  StepOrder: number;
  Task?: Task;
  Trajectory?: LearningTrajectory;
}

/* ── Группы детей ── */

export interface ChildGroup {
  PK_GroupId: number;
  GroupName: string;
  FK_EducatorId: number;
  Educator?: Educator;
}

export interface ChildGroupMember {
  PK_MemberId: number;
  FK_GroupId: number;
  FK_ChildId: number;
  Group?: ChildGroup;
  Child?: Child;
}
