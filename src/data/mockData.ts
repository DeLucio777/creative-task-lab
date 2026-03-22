import type { Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role, FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, TaskConstruction } from '@/types/models';

// Local runtime storage — starts empty, populated only by local fallback creates
export const MOCK_ROLES: Role[] = [];
export const MOCK_USERS: User[] = [];
export const MOCK_TEMPLATES: TaskTemplate[] = [];
export const MOCK_TASKS: Task[] = [];
export const MOCK_PECS: CatalogPECS[] = [];
export const MOCK_MEDIA: MediaCatalog[] = [];
export const MOCK_FIND_ODD_ITEMS: FindOddOneOutItem[] = [];
export const MOCK_MATCH_PAIRS: MatchImageWordPair[] = [];
export const MOCK_SEQUENCE_ITEMS: SequenceItem[] = [];
export const MOCK_SORT_ITEMS: SortItem[] = [];
export const MOCK_TASK_CONSTRUCTIONS: TaskConstruction[] = [];
