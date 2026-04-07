import type {
  Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role,
  FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, TaskConstruction,
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember
} from '@/types/models';

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
export const MOCK_CHILDREN: Child[] = [];
export const MOCK_EDUCATORS: Educator[] = [];
export const MOCK_REPRESENTATIVES: LegalRepresentative[] = [];
export const MOCK_SENSORY_PROFILES: SensoryProfile[] = [];
export const MOCK_ASSIGNMENTS: TaskAssignment[] = [];
export const MOCK_PROGRESS: ProgressRecord[] = [];
export const MOCK_REWARDS: Reward[] = [];
export const MOCK_TRAJECTORIES: LearningTrajectory[] = [];
export const MOCK_TRAJECTORY_STEPS: TrajectoryStep[] = [];
export const MOCK_GROUPS: ChildGroup[] = [];
export const MOCK_GROUP_MEMBERS: ChildGroupMember[] = [];
