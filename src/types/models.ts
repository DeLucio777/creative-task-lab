export interface Role {
  PK_RoleId: number;
  RoleName?: string;
}

export interface User {
  PK_UserId: number;
  UserLogin: string;
  UserPassword: string;
  FK_RoleId?: number;
  Role?: Role;
}

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
