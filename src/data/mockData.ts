import type {
  Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role,
  FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, TaskConstruction,
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember
} from '@/types/models';

/* ── Роли и пользователи ── */

export const MOCK_ROLES: Role[] = [
  { PK_RoleId: 1, RoleName: 'Администратор', RoleKey: 'admin' },
  { PK_RoleId: 2, RoleName: 'Педагог', RoleKey: 'educator' },
  { PK_RoleId: 3, RoleName: 'Родитель', RoleKey: 'parent' },
];

export const MOCK_USERS: User[] = [
  { PK_UserId: 1, UserLogin: 'admin', UserPassword: '', FK_RoleId: 1 },
  { PK_UserId: 2, UserLogin: 'educator', UserPassword: '', FK_RoleId: 2 },
  { PK_UserId: 3, UserLogin: 'parent', UserPassword: '', FK_RoleId: 3 },
  { PK_UserId: 4, UserLogin: 'ivanova', UserPassword: '', FK_RoleId: 2 },
  { PK_UserId: 5, UserLogin: 'petrov', UserPassword: '', FK_RoleId: 3 },
];

/* ── Педагоги ── */

export const MOCK_EDUCATORS: Educator[] = [
  { PK_EducatorId: 1, FK_UserId: 2, FullName: 'Смирнова Елена Петровна', Specialization: 'Дефектолог', Phone: '+7 (900) 111-22-33', Email: 'smirnova@edu.ru' },
  { PK_EducatorId: 2, FK_UserId: 4, FullName: 'Иванова Мария Сергеевна', Specialization: 'Логопед', Phone: '+7 (900) 444-55-66', Email: 'ivanova@edu.ru' },
];

/* ── Представители (родители) ── */

export const MOCK_REPRESENTATIVES: LegalRepresentative[] = [
  { PK_RepresentativeId: 1, FK_UserId: 3, FullName: 'Козлова Анна Викторовна', RelationType: 'мать', Phone: '+7 (900) 777-88-99', Email: 'kozlova@mail.ru' },
  { PK_RepresentativeId: 2, FK_UserId: 5, FullName: 'Петров Дмитрий Олегович', RelationType: 'отец', Phone: '+7 (900) 222-33-44', Email: 'petrov@mail.ru' },
];

/* ── Дети ── */

export const MOCK_CHILDREN: Child[] = [
  { PK_ChildId: 1, FullName: 'Козлов Артём', BirthDate: '2018-03-15', SpeechLevel: 'Базовый', PerceptionFeatures: 'Чувствительность к громким звукам', FK_RepresentativeId: 1, FK_EducatorId: 1 },
  { PK_ChildId: 2, FullName: 'Козлова Мия', BirthDate: '2019-07-22', SpeechLevel: 'Развитый', PerceptionFeatures: 'Предпочитает визуальные подсказки', FK_RepresentativeId: 1, FK_EducatorId: 1 },
  { PK_ChildId: 3, FullName: 'Петров Максим', BirthDate: '2017-11-05', SpeechLevel: 'Минимальный', PerceptionFeatures: 'Тактильная гиперчувствительность', FK_RepresentativeId: 2, FK_EducatorId: 2 },
  { PK_ChildId: 4, FullName: 'Сидорова Алиса', BirthDate: '2020-01-30', SpeechLevel: 'Базовый', PerceptionFeatures: 'Нормальное', FK_RepresentativeId: undefined, FK_EducatorId: 1 },
];

/* ── Сенсорные профили ── */

export const MOCK_SENSORY_PROFILES: SensoryProfile[] = [
  { PK_ProfileId: 1, FK_ChildId: 1, BackgroundColor: '#FFF9E6', FontSize: 18, ExcludeLoudSounds: true, RewardAnimation: 'confetti' },
  { PK_ProfileId: 2, FK_ChildId: 3, BackgroundColor: '#E6F0FF', FontSize: 22, ExcludeLoudSounds: true, RewardAnimation: 'stars' },
];

/* ── Шаблоны заданий ── */

export const MOCK_TEMPLATES: TaskTemplate[] = [
  { PK_TemplateId: 1, TemplateName: 'Найди лишнее', Descripti: 'Ребёнок выбирает предмет, который не подходит к остальным' },
  { PK_TemplateId: 2, TemplateName: 'Соотнеси картинку и слово', Descripti: 'Сопоставление изображения с текстовой подписью' },
  { PK_TemplateId: 3, TemplateName: 'Построй последовательность', Descripti: 'Расположить элементы в правильном порядке' },
  { PK_TemplateId: 4, TemplateName: 'Сортировка', Descripti: 'Распределить элементы по категориям' },
];

/* ── Задания ── */

export const MOCK_TASKS: Task[] = [
  { PK_TaskId: 1, Title: 'Фрукты: найди лишнее', Descripti: 'Определи, какой предмет не является фруктом', FK_TemplateId: 1, FK_UserId: 2, DifficultyLevel: 'Easy', CreatedDate: '2025-12-01T10:00:00Z', IsPublished: true },
  { PK_TaskId: 2, Title: 'Животные и слова', Descripti: 'Соотнеси изображение животного с его названием', FK_TemplateId: 2, FK_UserId: 2, DifficultyLevel: 'Medium', CreatedDate: '2025-12-05T14:30:00Z', IsPublished: true },
  { PK_TaskId: 3, Title: 'Утренняя рутина', Descripti: 'Расположи действия утренней рутины в правильном порядке', FK_TemplateId: 3, FK_UserId: 4, DifficultyLevel: 'Medium', CreatedDate: '2025-12-10T09:00:00Z', IsPublished: true },
  { PK_TaskId: 4, Title: 'Сортировка: одежда и еда', Descripti: 'Распредели предметы по категориям: одежда или еда', FK_TemplateId: 4, FK_UserId: 2, DifficultyLevel: 'Easy', CreatedDate: '2025-12-15T11:00:00Z', IsPublished: true },
  { PK_TaskId: 5, Title: 'Транспорт: найди лишнее', Descripti: 'Определи, какой транспорт не подходит к остальным', FK_TemplateId: 1, FK_UserId: 4, DifficultyLevel: 'Hard', CreatedDate: '2026-01-08T08:00:00Z', IsPublished: false },
  { PK_TaskId: 6, Title: 'Цвета и формы', Descripti: 'Сопоставь цвет с фигурой', FK_TemplateId: 2, FK_UserId: 2, DifficultyLevel: 'Easy', CreatedDate: '2026-01-20T15:00:00Z', IsPublished: true },
  { PK_TaskId: 7, Title: 'Цепочка действий: одевание', Descripti: 'Расположи этапы одевания в правильном порядке', FK_TemplateId: 3, FK_UserId: 4, DifficultyLevel: 'Hard', CreatedDate: '2026-02-03T12:00:00Z', IsPublished: true },
];

/* ── Конструкции заданий ── */

export const MOCK_TASK_CONSTRUCTIONS: TaskConstruction[] = [
  { PK_ConstructionId: 1, FK_TaskId: 1, ParameterName: 'category', ParameterValue: 'фрукты' },
  { PK_ConstructionId: 2, FK_TaskId: 1, ParameterName: 'itemCount', ParameterValue: '4' },
  { PK_ConstructionId: 3, FK_TaskId: 2, ParameterName: 'pairsCount', ParameterValue: '5' },
  { PK_ConstructionId: 4, FK_TaskId: 3, ParameterName: 'stepsCount', ParameterValue: '5' },
  { PK_ConstructionId: 5, FK_TaskId: 4, ParameterName: 'categories', ParameterValue: 'одежда,еда' },
];

/* ── Элементы заданий ── */

export const MOCK_FIND_ODD_ITEMS: FindOddOneOutItem[] = [
  { PK_ItemId: 1, FK_TaskId: 1, ItemText: 'Яблоко', IsOddOne: false },
  { PK_ItemId: 2, FK_TaskId: 1, ItemText: 'Банан', IsOddOne: false },
  { PK_ItemId: 3, FK_TaskId: 1, ItemText: 'Морковь', IsOddOne: true },
  { PK_ItemId: 4, FK_TaskId: 1, ItemText: 'Груша', IsOddOne: false },
  { PK_ItemId: 5, FK_TaskId: 5, ItemText: 'Автобус', IsOddOne: false },
  { PK_ItemId: 6, FK_TaskId: 5, ItemText: 'Трамвай', IsOddOne: false },
  { PK_ItemId: 7, FK_TaskId: 5, ItemText: 'Велосипед', IsOddOne: true },
  { PK_ItemId: 8, FK_TaskId: 5, ItemText: 'Троллейбус', IsOddOne: false },
];

export const MOCK_MATCH_PAIRS: MatchImageWordPair[] = [
  { PK_PairId: 1, FK_TaskId: 2, FK_MediaId: 1, Words: 'Кошка' },
  { PK_PairId: 2, FK_TaskId: 2, FK_MediaId: 2, Words: 'Собака' },
  { PK_PairId: 3, FK_TaskId: 6, FK_MediaId: 3, Words: 'Красный круг' },
  { PK_PairId: 4, FK_TaskId: 6, FK_MediaId: 4, Words: 'Синий квадрат' },
];

export const MOCK_SEQUENCE_ITEMS: SequenceItem[] = [
  { PK_SeqItemId: 1, FK_TaskId: 3, ItemOrder: 1, ItemValue: 'Проснуться' },
  { PK_SeqItemId: 2, FK_TaskId: 3, ItemOrder: 2, ItemValue: 'Умыться' },
  { PK_SeqItemId: 3, FK_TaskId: 3, ItemOrder: 3, ItemValue: 'Одеться' },
  { PK_SeqItemId: 4, FK_TaskId: 3, ItemOrder: 4, ItemValue: 'Позавтракать' },
  { PK_SeqItemId: 5, FK_TaskId: 3, ItemOrder: 5, ItemValue: 'Выйти из дома' },
  { PK_SeqItemId: 6, FK_TaskId: 7, ItemOrder: 1, ItemValue: 'Надеть нижнее бельё' },
  { PK_SeqItemId: 7, FK_TaskId: 7, ItemOrder: 2, ItemValue: 'Надеть штаны' },
  { PK_SeqItemId: 8, FK_TaskId: 7, ItemOrder: 3, ItemValue: 'Надеть футболку' },
  { PK_SeqItemId: 9, FK_TaskId: 7, ItemOrder: 4, ItemValue: 'Надеть обувь' },
];

export const MOCK_SORT_ITEMS: SortItem[] = [
  { PK_SortItemId: 1, FK_TaskId: 4, ItemValue: 'Куртка', SortKey: 'одежда' },
  { PK_SortItemId: 2, FK_TaskId: 4, ItemValue: 'Яблоко', SortKey: 'еда' },
  { PK_SortItemId: 3, FK_TaskId: 4, ItemValue: 'Шапка', SortKey: 'одежда' },
  { PK_SortItemId: 4, FK_TaskId: 4, ItemValue: 'Хлеб', SortKey: 'еда' },
  { PK_SortItemId: 5, FK_TaskId: 4, ItemValue: 'Носки', SortKey: 'одежда' },
  { PK_SortItemId: 6, FK_TaskId: 4, ItemValue: 'Молоко', SortKey: 'еда' },
];

/* ── PECS каталог ── */

export const MOCK_PECS: CatalogPECS[] = [
  { PK_PECSid: 1, Descripti: 'Я хочу', filePath: '/placeholder.svg', Category: 'Коммуникация', UploadDate: '2025-11-01' },
  { PK_PECSid: 2, Descripti: 'Помоги мне', filePath: '/placeholder.svg', Category: 'Коммуникация', UploadDate: '2025-11-01' },
  { PK_PECSid: 3, Descripti: 'Яблоко', filePath: '/placeholder.svg', Category: 'Еда', UploadDate: '2025-11-05' },
  { PK_PECSid: 4, Descripti: 'Банан', filePath: '/placeholder.svg', Category: 'Еда', UploadDate: '2025-11-05' },
  { PK_PECSid: 5, Descripti: 'Кошка', filePath: '/placeholder.svg', Category: 'Животные', UploadDate: '2025-11-10' },
  { PK_PECSid: 6, Descripti: 'Собака', filePath: '/placeholder.svg', Category: 'Животные', UploadDate: '2025-11-10' },
  { PK_PECSid: 7, Descripti: 'Туалет', filePath: '/placeholder.svg', Category: 'Потребности', UploadDate: '2025-11-15' },
  { PK_PECSid: 8, Descripti: 'Пить', filePath: '/placeholder.svg', Category: 'Потребности', UploadDate: '2025-11-15' },
];

/* ── Медиа каталог ── */

export const MOCK_MEDIA: MediaCatalog[] = [
  { PK_MediaId: 1, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Кошка — фото', UploadDate: '2025-11-01' },
  { PK_MediaId: 2, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Собака — фото', UploadDate: '2025-11-01' },
  { PK_MediaId: 3, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Красный круг', UploadDate: '2025-11-10' },
  { PK_MediaId: 4, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Синий квадрат', UploadDate: '2025-11-10' },
  { PK_MediaId: 5, FileType: 'audio/mp3', FilePath: '/placeholder.svg', Descripti: 'Звук кошки', UploadDate: '2025-11-15' },
];

/* ── Назначения заданий ── */

export const MOCK_ASSIGNMENTS: TaskAssignment[] = [
  { PK_AssignmentId: 1, FK_TaskId: 1, FK_ChildId: 1, AssignedDate: '2026-01-10T10:00:00Z', DueDate: '2026-01-17T10:00:00Z', Status: 'completed' },
  { PK_AssignmentId: 2, FK_TaskId: 2, FK_ChildId: 1, AssignedDate: '2026-01-15T10:00:00Z', DueDate: '2026-01-22T10:00:00Z', Status: 'in_progress' },
  { PK_AssignmentId: 3, FK_TaskId: 4, FK_ChildId: 2, AssignedDate: '2026-01-20T10:00:00Z', DueDate: '2026-01-27T10:00:00Z', Status: 'completed' },
  { PK_AssignmentId: 4, FK_TaskId: 3, FK_ChildId: 3, AssignedDate: '2026-02-01T10:00:00Z', DueDate: '2026-02-08T10:00:00Z', Status: 'pending' },
  { PK_AssignmentId: 5, FK_TaskId: 6, FK_ChildId: 4, AssignedDate: '2026-02-05T10:00:00Z', Status: 'in_progress' },
  { PK_AssignmentId: 6, FK_TaskId: 1, FK_ChildId: 3, AssignedDate: '2026-02-10T10:00:00Z', DueDate: '2026-02-17T10:00:00Z', Status: 'completed' },
];

/* ── Прогресс ── */

export const MOCK_PROGRESS: ProgressRecord[] = [
  { PK_ProgressId: 1, FK_AssignmentId: 1, FK_ChildId: 1, CompletedDate: '2026-01-12T14:30:00Z', ErrorCount: 1, HintsUsed: 2, TimeTakenSeconds: 120, IsCorrect: true },
  { PK_ProgressId: 2, FK_AssignmentId: 1, FK_ChildId: 1, CompletedDate: '2026-01-11T10:00:00Z', ErrorCount: 3, HintsUsed: 4, TimeTakenSeconds: 180, IsCorrect: false },
  { PK_ProgressId: 3, FK_AssignmentId: 3, FK_ChildId: 2, CompletedDate: '2026-01-22T11:00:00Z', ErrorCount: 0, HintsUsed: 1, TimeTakenSeconds: 90, IsCorrect: true },
  { PK_ProgressId: 4, FK_AssignmentId: 6, FK_ChildId: 3, CompletedDate: '2026-02-12T09:00:00Z', ErrorCount: 2, HintsUsed: 3, TimeTakenSeconds: 150, IsCorrect: true },
  { PK_ProgressId: 5, FK_AssignmentId: 6, FK_ChildId: 3, CompletedDate: '2026-02-11T09:00:00Z', ErrorCount: 4, HintsUsed: 5, TimeTakenSeconds: 200, IsCorrect: false },
];

/* ── Награды ── */

export const MOCK_REWARDS: Reward[] = [
  { PK_RewardId: 1, FK_ChildId: 1, RewardType: 'star', RewardValue: '⭐', EarnedDate: '2026-01-12T14:31:00Z' },
  { PK_RewardId: 2, FK_ChildId: 1, RewardType: 'badge', RewardValue: '🏅', EarnedDate: '2026-01-12T14:31:00Z' },
  { PK_RewardId: 3, FK_ChildId: 2, RewardType: 'star', RewardValue: '⭐', EarnedDate: '2026-01-22T11:01:00Z' },
  { PK_RewardId: 4, FK_ChildId: 3, RewardType: 'star', RewardValue: '⭐', EarnedDate: '2026-02-12T09:01:00Z' },
  { PK_RewardId: 5, FK_ChildId: 3, RewardType: 'badge', RewardValue: '🎖️', EarnedDate: '2026-02-12T09:01:00Z' },
];

/* ── Траектории обучения ── */

export const MOCK_TRAJECTORIES: LearningTrajectory[] = [
  { PK_TrajectoryId: 1, TrajectoryName: 'Базовая коммуникация', FK_EducatorId: 1, Descripti: 'Начальный уровень общения с помощью PECS' },
  { PK_TrajectoryId: 2, TrajectoryName: 'Повседневные навыки', FK_EducatorId: 2, Descripti: 'Последовательности ежедневных действий' },
];

export const MOCK_TRAJECTORY_STEPS: TrajectoryStep[] = [
  { PK_StepId: 1, FK_TrajectoryId: 1, FK_TaskId: 1, StepOrder: 1 },
  { PK_StepId: 2, FK_TrajectoryId: 1, FK_TaskId: 2, StepOrder: 2 },
  { PK_StepId: 3, FK_TrajectoryId: 1, FK_TaskId: 6, StepOrder: 3 },
  { PK_StepId: 4, FK_TrajectoryId: 2, FK_TaskId: 3, StepOrder: 1 },
  { PK_StepId: 5, FK_TrajectoryId: 2, FK_TaskId: 7, StepOrder: 2 },
  { PK_StepId: 6, FK_TrajectoryId: 2, FK_TaskId: 4, StepOrder: 3 },
];

/* ── Группы детей ── */

export const MOCK_GROUPS: ChildGroup[] = [
  { PK_GroupId: 1, GroupName: 'Группа «Солнышко»', FK_EducatorId: 1 },
  { PK_GroupId: 2, GroupName: 'Группа «Звёздочки»', FK_EducatorId: 2 },
];

export const MOCK_GROUP_MEMBERS: ChildGroupMember[] = [
  { PK_MemberId: 1, FK_GroupId: 1, FK_ChildId: 1 },
  { PK_MemberId: 2, FK_GroupId: 1, FK_ChildId: 2 },
  { PK_MemberId: 3, FK_GroupId: 1, FK_ChildId: 4 },
  { PK_MemberId: 4, FK_GroupId: 2, FK_ChildId: 3 },
];
