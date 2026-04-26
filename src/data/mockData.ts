import type {
  Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role,
  FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, TaskConstruction,
  Child, Educator, LegalRepresentative, SensoryProfile,
  TaskAssignment, ProgressRecord, Reward,
  LearningTrajectory, TrajectoryStep, ChildGroup, ChildGroupMember,
  Disease, UserInfo, Achievement, UserAchievement,
  TaskList, TaskListItem,
} from '@/types/models';

/* ── Роли и пользователи ── */

export const MOCK_ROLES: Role[] = [
  { PK_RoleId: 1, RoleName: 'Администратор', RoleKey: 'admin' },
  { PK_RoleId: 2, RoleName: 'Педагог', RoleKey: 'educator' },
  { PK_RoleId: 3, RoleName: 'Представитель/Ребёнок', RoleKey: 'parent' },
];

export const MOCK_USERS: User[] = [
  // Админ
  { PK_UserId: 1, UserLogin: 'admin', UserPassword: '', FK_RoleId: 1,
    first_name: 'Александр', second_name: 'Орлов', phone: '+375 (29) 000-00-01' },
  // Педагоги
  { PK_UserId: 2, UserLogin: 'educator', UserPassword: '', FK_RoleId: 2,
    first_name: 'Елена', second_name: 'Смирнова', phone: '+375 (29) 111-22-33' },
  { PK_UserId: 4, UserLogin: 'ivanova', UserPassword: '', FK_RoleId: 2,
    first_name: 'Мария', second_name: 'Иванова', phone: '+375 (44) 444-55-66' },
  // Представители (родители) — они же «дети» с точки зрения логина
  { PK_UserId: 3, UserLogin: 'parent', UserPassword: '', FK_RoleId: 3,
    first_name: 'Анна', second_name: 'Козлова', phone: '+375 (33) 777-88-99' },
  { PK_UserId: 5, UserLogin: 'petrov', UserPassword: '', FK_RoleId: 3,
    first_name: 'Дмитрий', second_name: 'Петров', phone: '+375 (25) 222-33-44' },
];

/* ── Педагоги (расширение User) ── */
export const MOCK_EDUCATORS: Educator[] = [
  { PK_EducatorId: 1, FK_UserId: 2, FullName: 'Смирнова Елена Петровна', Specialization: 'Дефектолог', Phone: '+375 (29) 111-22-33', Email: 'smirnova@edu.by' },
  { PK_EducatorId: 2, FK_UserId: 4, FullName: 'Иванова Мария Сергеевна', Specialization: 'Логопед',     Phone: '+375 (44) 444-55-66', Email: 'ivanova@edu.by' },
];

/* ── Представители ── */
export const MOCK_REPRESENTATIVES: LegalRepresentative[] = [
  { PK_RepresentativeId: 1, FK_UserId: 3, FullName: 'Козлова Анна Викторовна', RelationType: 'мать', Phone: '+375 (33) 777-88-99', Email: 'kozlova@mail.by' },
  { PK_RepresentativeId: 2, FK_UserId: 5, FullName: 'Петров Дмитрий Олегович', RelationType: 'отец', Phone: '+375 (25) 222-33-44', Email: 'petrov@mail.by' },
];

/* ── Дети ── */
export const MOCK_CHILDREN: Child[] = [
  { PK_ChildId: 1, FullName: 'Козлов Артём',  BirthDate: '2018-03-15', SpeechLevel: 'Базовый',     PerceptionFeatures: 'Чувствительность к громким звукам', FK_RepresentativeId: 1, FK_EducatorId: 1 },
  { PK_ChildId: 2, FullName: 'Козлова Мия',   BirthDate: '2019-07-22', SpeechLevel: 'Развитый',    PerceptionFeatures: 'Предпочитает визуальные подсказки',  FK_RepresentativeId: 1, FK_EducatorId: 1 },
  { PK_ChildId: 3, FullName: 'Петров Максим', BirthDate: '2017-11-05', SpeechLevel: 'Минимальный', PerceptionFeatures: 'Тактильная гиперчувствительность',   FK_RepresentativeId: 2, FK_EducatorId: 2 },
  { PK_ChildId: 4, FullName: 'Сидорова Алиса',BirthDate: '2020-01-30', SpeechLevel: 'Базовый',     PerceptionFeatures: 'Норма', FK_EducatorId: 1 },
];

/* ── Сенсорные профили ── */
export const MOCK_SENSORY_PROFILES: SensoryProfile[] = [
  { PK_ProfileId: 1, FK_ChildId: 1, BackgroundColor: '#FFF9E6', FontSize: 18, ExcludeLoudSounds: true,  RewardAnimation: 'confetti' },
  { PK_ProfileId: 2, FK_ChildId: 3, BackgroundColor: '#E6F0FF', FontSize: 22, ExcludeLoudSounds: true,  RewardAnimation: 'stars' },
];

/* ── Заболевания ── */
export const MOCK_DISEASES: Disease[] = [
  { PK_Id: 1, name: 'РАС, лёгкая форма' },
  { PK_Id: 2, name: 'РАС, средняя форма' },
  { PK_Id: 3, name: 'РАС, тяжёлая форма' },
  { PK_Id: 4, name: 'Синдром Аспергера' },
];

/* ── tbl_user_info: связь ребёнок ↔ доп.инфа ── */
export const MOCK_USER_INFO: UserInfo[] = [
  { PK_Id: 1, FK_user_id: 3, FK_disease_id: 1, complited_tasks_count: 8, helpe_used_count: 12, miss_tasks_count: 1, age: 7, FK_RepresentativeUserId: 3, FK_EducatorUserId: 2 },
  { PK_Id: 2, FK_user_id: 5, FK_disease_id: 2, complited_tasks_count: 5, helpe_used_count: 9,  miss_tasks_count: 2, age: 8, FK_RepresentativeUserId: 5, FK_EducatorUserId: 4 },
];

/* ── Шаблоны заданий ── */
export const MOCK_TEMPLATES: TaskTemplate[] = [
  { PK_TemplateId: 1, TemplateName: 'Найди лишнее', Descripti: 'Ребёнок выбирает предмет, который не подходит к остальным' },
  { PK_TemplateId: 2, TemplateName: 'Соотнеси картинку и слово', Descripti: 'Сопоставление изображения с текстовой подписью' },
  { PK_TemplateId: 3, TemplateName: 'Построй последовательность', Descripti: 'Расположить элементы в правильном порядке' },
  { PK_TemplateId: 4, TemplateName: 'Сортировка', Descripti: 'Распределить элементы по категориям' },
];

/* ── Задания (UploadDate ≈ дата создания) ── */
export const MOCK_TASKS: Task[] = [
  { PK_TaskId: 1, Title: 'Фрукты: найди лишнее',         Descripti: 'Определи, какой предмет не является фруктом',          FK_TemplateId: 1, FK_UserId: 2, DifficultyLevel: 'Easy',   UploadDate: '2025-12-01', CreatedDate: '2025-12-01T10:00:00Z', IsPublished: true  },
  { PK_TaskId: 2, Title: 'Животные и слова',             Descripti: 'Соотнеси изображение животного с его названием',       FK_TemplateId: 2, FK_UserId: 2, DifficultyLevel: 'Medium', UploadDate: '2025-12-05', CreatedDate: '2025-12-05T14:30:00Z', IsPublished: true  },
  { PK_TaskId: 3, Title: 'Утренняя рутина',              Descripti: 'Расположи действия утренней рутины',                   FK_TemplateId: 3, FK_UserId: 4, DifficultyLevel: 'Medium', UploadDate: '2025-12-10', CreatedDate: '2025-12-10T09:00:00Z', IsPublished: true  },
  { PK_TaskId: 4, Title: 'Сортировка: одежда и еда',     Descripti: 'Распредели предметы по категориям',                    FK_TemplateId: 4, FK_UserId: 2, DifficultyLevel: 'Easy',   UploadDate: '2025-12-15', CreatedDate: '2025-12-15T11:00:00Z', IsPublished: true  },
  { PK_TaskId: 5, Title: 'Транспорт: найди лишнее',      Descripti: 'Определи лишний транспорт',                            FK_TemplateId: 1, FK_UserId: 4, DifficultyLevel: 'Hard',   UploadDate: '2026-01-08', CreatedDate: '2026-01-08T08:00:00Z', IsPublished: false },
  { PK_TaskId: 6, Title: 'Цвета и формы',                Descripti: 'Сопоставь цвет с фигурой',                             FK_TemplateId: 2, FK_UserId: 2, DifficultyLevel: 'Easy',   UploadDate: '2026-01-20', CreatedDate: '2026-01-20T15:00:00Z', IsPublished: true  },
  { PK_TaskId: 7, Title: 'Цепочка: одевание',            Descripti: 'Расположи этапы одевания',                             FK_TemplateId: 3, FK_UserId: 4, DifficultyLevel: 'Hard',   UploadDate: '2026-02-03', CreatedDate: '2026-02-03T12:00:00Z', IsPublished: true  },
];

/* ── Конструкции заданий ── */
export const MOCK_TASK_CONSTRUCTIONS: TaskConstruction[] = [
  { PK_ConstructionId: 1,  FK_TaskId: 1, ParameterName: 'category',   ParameterValue: 'фрукты' },
  { PK_ConstructionId: 2,  FK_TaskId: 1, ParameterName: 'itemCount',  ParameterValue: '4' },
  { PK_ConstructionId: 3,  FK_TaskId: 2, ParameterName: 'pairsCount', ParameterValue: '5' },
  { PK_ConstructionId: 4,  FK_TaskId: 3, ParameterName: 'stepsCount', ParameterValue: '5' },
  { PK_ConstructionId: 5,  FK_TaskId: 4, ParameterName: 'categories', ParameterValue: 'одежда,еда' },
  // Подсказки (новое поле HintText)
  { PK_ConstructionId: 10, FK_TaskId: 1, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 11, FK_TaskId: 1, ParameterName: 'HintText',  ParameterValue: 'Фрукты — это сладкие плоды растений. Что из этого не растёт на дереве? 🍎' },
  { PK_ConstructionId: 12, FK_TaskId: 2, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 13, FK_TaskId: 2, ParameterName: 'HintText',  ParameterValue: 'Внимательно посмотри на картинку и подбери название животного. 🐾' },
  { PK_ConstructionId: 14, FK_TaskId: 3, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 15, FK_TaskId: 3, ParameterName: 'HintText',  ParameterValue: 'Подумай, что обычно делают сразу после пробуждения. Шаги идут по порядку. ⏰' },
  { PK_ConstructionId: 16, FK_TaskId: 4, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 17, FK_TaskId: 4, ParameterName: 'HintText',  ParameterValue: 'Одежду носят, а еду — едят. Распредели предметы в правильную корзину. 👕🥕' },
  { PK_ConstructionId: 18, FK_TaskId: 5, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 19, FK_TaskId: 5, ParameterName: 'HintText',  ParameterValue: 'Транспорт — это то, на чём ездят. У какого предмета нет двигателя? 🚗' },
  { PK_ConstructionId: 20, FK_TaskId: 6, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 21, FK_TaskId: 6, ParameterName: 'HintText',  ParameterValue: 'Сначала смотри на цвет, потом на форму. Назови вслух, что видишь. 🎨' },
  { PK_ConstructionId: 22, FK_TaskId: 7, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 23, FK_TaskId: 7, ParameterName: 'HintText',  ParameterValue: 'Сначала надевают то, что ближе к телу. В конце — обувь. 👟' },
];

/* ── Элементы заданий ── */
export const MOCK_FIND_ODD_ITEMS: FindOddOneOutItem[] = [
  { PK_ItemId: 1, FK_TaskId: 1, ItemText: 'Яблоко',     IsOddOne: false },
  { PK_ItemId: 2, FK_TaskId: 1, ItemText: 'Банан',      IsOddOne: false },
  { PK_ItemId: 3, FK_TaskId: 1, ItemText: 'Морковь',    IsOddOne: true  },
  { PK_ItemId: 4, FK_TaskId: 1, ItemText: 'Груша',      IsOddOne: false },
  { PK_ItemId: 5, FK_TaskId: 5, ItemText: 'Автобус',    IsOddOne: false },
  { PK_ItemId: 6, FK_TaskId: 5, ItemText: 'Трамвай',    IsOddOne: false },
  { PK_ItemId: 7, FK_TaskId: 5, ItemText: 'Велосипед',  IsOddOne: true  },
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
  { PK_SortItemId: 3, FK_TaskId: 4, ItemValue: 'Шапка',  SortKey: 'одежда' },
  { PK_SortItemId: 4, FK_TaskId: 4, ItemValue: 'Хлеб',   SortKey: 'еда' },
  { PK_SortItemId: 5, FK_TaskId: 4, ItemValue: 'Носки',  SortKey: 'одежда' },
  { PK_SortItemId: 6, FK_TaskId: 4, ItemValue: 'Молоко', SortKey: 'еда' },
];

/* ── PECS ── */
export const MOCK_PECS: CatalogPECS[] = [
  { PK_PECSid: 1, Descripti: 'Я хочу',     filePath: '/placeholder.svg', Category: 'Коммуникация', UploadDate: '2025-11-01' },
  { PK_PECSid: 2, Descripti: 'Помоги мне', filePath: '/placeholder.svg', Category: 'Коммуникация', UploadDate: '2025-11-01' },
  { PK_PECSid: 3, Descripti: 'Яблоко',     filePath: '/placeholder.svg', Category: 'Еда',          UploadDate: '2025-11-05' },
  { PK_PECSid: 4, Descripti: 'Банан',      filePath: '/placeholder.svg', Category: 'Еда',          UploadDate: '2025-11-05' },
  { PK_PECSid: 5, Descripti: 'Кошка',      filePath: '/placeholder.svg', Category: 'Животные',     UploadDate: '2025-11-10' },
  { PK_PECSid: 6, Descripti: 'Собака',     filePath: '/placeholder.svg', Category: 'Животные',     UploadDate: '2025-11-10' },
  { PK_PECSid: 7, Descripti: 'Туалет',     filePath: '/placeholder.svg', Category: 'Потребности',  UploadDate: '2025-11-15' },
  { PK_PECSid: 8, Descripti: 'Пить',       filePath: '/placeholder.svg', Category: 'Потребности',  UploadDate: '2025-11-15' },
];

/* ── Медиа ── */
export const MOCK_MEDIA: MediaCatalog[] = [
  { PK_MediaId: 1, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Кошка — фото',  UploadDate: '2025-11-01' },
  { PK_MediaId: 2, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Собака — фото', UploadDate: '2025-11-01' },
  { PK_MediaId: 3, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Красный круг',  UploadDate: '2025-11-10' },
  { PK_MediaId: 4, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Синий квадрат', UploadDate: '2025-11-10' },
  { PK_MediaId: 5, FileType: 'audio/mp3', FilePath: '/placeholder.svg', Descripti: 'Звук кошки',    UploadDate: '2025-11-15' },
];

/* ── Группы ── */
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

/* ── Цепочки заданий (tbl_task_list) ── */
const today = new Date();
const tomorrow = new Date(today.getTime() + 86400000);
const nextWeek = new Date(today.getTime() + 7 * 86400000);

export const MOCK_TASK_LISTS: TaskList[] = [
  { PK_id: 1, Title: 'Базовая коммуникация',  Descripti: 'Стартовый набор для развития общения', date_complite: tomorrow.toISOString(), teacher_id: 2 },
  { PK_id: 2, Title: 'Повседневные навыки',   Descripti: 'Действия по дому',                     date_complite: nextWeek.toISOString(), teacher_id: 4 },
  { PK_id: 3, Title: 'Сортировка предметов',  Descripti: 'Учимся группировать',                  date_complite: nextWeek.toISOString(), teacher_id: 2 },
];

export const MOCK_TASK_LIST_ITEMS: TaskListItem[] = [
  // Цепочка 1 → ребёнок (user 3)
  { id: 1, task_id: 1, task_list_id: 1, position: 1, user_id: 3, complited: true  },
  { id: 2, task_id: 2, task_list_id: 1, position: 2, user_id: 3, complited: false },
  { id: 3, task_id: 6, task_list_id: 1, position: 3, user_id: 3, complited: false },
  // Цепочка 2 → ребёнок (user 5)
  { id: 4, task_id: 3, task_list_id: 2, position: 1, user_id: 5, complited: true  },
  { id: 5, task_id: 7, task_list_id: 2, position: 2, user_id: 5, complited: false },
  { id: 6, task_id: 4, task_list_id: 2, position: 3, user_id: 5, complited: false },
  // Цепочка 3 → ребёнок (user 3)
  { id: 7, task_id: 4, task_list_id: 3, position: 1, user_id: 3, complited: false },
];

/* ── Назначения (легаси, для отчётов) ── */
export const MOCK_ASSIGNMENTS: TaskAssignment[] = [
  { PK_AssignmentId: 1, FK_TaskId: 1, FK_ChildId: 1, AssignedDate: '2026-01-10T10:00:00Z', DueDate: '2026-01-17T10:00:00Z', Status: 'completed'   },
  { PK_AssignmentId: 2, FK_TaskId: 2, FK_ChildId: 1, AssignedDate: '2026-01-15T10:00:00Z', DueDate: '2026-01-22T10:00:00Z', Status: 'in_progress' },
  { PK_AssignmentId: 3, FK_TaskId: 4, FK_ChildId: 2, AssignedDate: '2026-01-20T10:00:00Z', DueDate: '2026-01-27T10:00:00Z', Status: 'completed'   },
  { PK_AssignmentId: 4, FK_TaskId: 3, FK_ChildId: 3, AssignedDate: '2026-02-01T10:00:00Z', DueDate: '2026-02-08T10:00:00Z', Status: 'pending'     },
  { PK_AssignmentId: 5, FK_TaskId: 6, FK_ChildId: 4, AssignedDate: '2026-02-05T10:00:00Z',                                  Status: 'in_progress' },
  { PK_AssignmentId: 6, FK_TaskId: 1, FK_ChildId: 3, AssignedDate: '2026-02-10T10:00:00Z', DueDate: '2026-02-17T10:00:00Z', Status: 'completed'   },
];

/* ── Прогресс ── */
export const MOCK_PROGRESS: ProgressRecord[] = [
  { PK_ProgressId: 1, FK_AssignmentId: 1, FK_ChildId: 1, CompletedDate: '2026-01-12T14:30:00Z', ErrorCount: 1, HintsUsed: 2, TimeTakenSeconds: 120, IsCorrect: true  },
  { PK_ProgressId: 2, FK_AssignmentId: 1, FK_ChildId: 1, CompletedDate: '2026-01-11T10:00:00Z', ErrorCount: 3, HintsUsed: 4, TimeTakenSeconds: 180, IsCorrect: false },
  { PK_ProgressId: 3, FK_AssignmentId: 3, FK_ChildId: 2, CompletedDate: '2026-01-22T11:00:00Z', ErrorCount: 0, HintsUsed: 1, TimeTakenSeconds: 90,  IsCorrect: true  },
  { PK_ProgressId: 4, FK_AssignmentId: 6, FK_ChildId: 3, CompletedDate: '2026-02-12T09:00:00Z', ErrorCount: 2, HintsUsed: 3, TimeTakenSeconds: 150, IsCorrect: true  },
  { PK_ProgressId: 5, FK_AssignmentId: 6, FK_ChildId: 3, CompletedDate: '2026-02-11T09:00:00Z', ErrorCount: 4, HintsUsed: 5, TimeTakenSeconds: 200, IsCorrect: false },
];

/* ── Награды (легаси) ── */
export const MOCK_REWARDS: Reward[] = [
  { PK_RewardId: 1, FK_ChildId: 1, RewardType: 'star',  RewardValue: '⭐',  EarnedDate: '2026-01-12T14:31:00Z' },
  { PK_RewardId: 2, FK_ChildId: 1, RewardType: 'badge', RewardValue: '🏅', EarnedDate: '2026-01-12T14:31:00Z' },
  { PK_RewardId: 3, FK_ChildId: 2, RewardType: 'star',  RewardValue: '⭐',  EarnedDate: '2026-01-22T11:01:00Z' },
  { PK_RewardId: 4, FK_ChildId: 3, RewardType: 'star',  RewardValue: '⭐',  EarnedDate: '2026-02-12T09:01:00Z' },
  { PK_RewardId: 5, FK_ChildId: 3, RewardType: 'badge', RewardValue: '🎖️', EarnedDate: '2026-02-12T09:01:00Z' },
];

/* ── Достижения ── */
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'Первое задание',         description: 'Выполнил первое задание',                image_id: 1 },
  { id: 2, name: 'Серия из 5',             description: '5 заданий подряд без ошибок',           image_id: 2 },
  { id: 3, name: 'Цепочка завершена',      description: 'Прошёл всю цепочку заданий',            image_id: 3 },
  { id: 4, name: 'Без подсказок',          description: 'Выполнил задание без использования подсказок', image_id: 4 },
];

export const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [
  { id: 1, achivement_id: 1, user_id: 3, earned_date: '2026-01-12T14:31:00Z' },
  { id: 2, achivement_id: 4, user_id: 3, earned_date: '2026-01-22T11:01:00Z' },
  { id: 3, achivement_id: 1, user_id: 5, earned_date: '2026-02-12T09:01:00Z' },
];

/* ── Траектории (легаси) ── */
export const MOCK_TRAJECTORIES: LearningTrajectory[] = [
  { PK_TrajectoryId: 1, TrajectoryName: 'Базовая коммуникация', FK_EducatorId: 1, Descripti: 'Начальный уровень общения' },
  { PK_TrajectoryId: 2, TrajectoryName: 'Повседневные навыки',  FK_EducatorId: 2, Descripti: 'Последовательности дел'   },
];

export const MOCK_TRAJECTORY_STEPS: TrajectoryStep[] = [
  { PK_StepId: 1, FK_TrajectoryId: 1, FK_TaskId: 1, StepOrder: 1 },
  { PK_StepId: 2, FK_TrajectoryId: 1, FK_TaskId: 2, StepOrder: 2 },
  { PK_StepId: 3, FK_TrajectoryId: 1, FK_TaskId: 6, StepOrder: 3 },
  { PK_StepId: 4, FK_TrajectoryId: 2, FK_TaskId: 3, StepOrder: 1 },
  { PK_StepId: 5, FK_TrajectoryId: 2, FK_TaskId: 7, StepOrder: 2 },
  { PK_StepId: 6, FK_TrajectoryId: 2, FK_TaskId: 4, StepOrder: 3 },
];
