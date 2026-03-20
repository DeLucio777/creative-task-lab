import type { Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role, FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, TaskConstruction } from '@/types/models';

export const MOCK_ROLES: Role[] = [
  { PK_RoleId: 1, RoleName: 'Администратор' },
  { PK_RoleId: 2, RoleName: 'Педагог' },
  { PK_RoleId: 3, RoleName: 'Гость' },
];

export const MOCK_USERS: User[] = [
  { PK_UserId: 1, UserLogin: 'admin', UserPassword: 'admin123', FK_RoleId: 1 },
  { PK_UserId: 2, UserLogin: 'teacher', UserPassword: 'teacher123', FK_RoleId: 2 },
];

export const MOCK_TEMPLATES: TaskTemplate[] = [
  { PK_TemplateId: 1, TemplateName: 'Последовательность', Descripti: 'Расставить элементы в правильном порядке' },
  { PK_TemplateId: 2, TemplateName: 'Сортировка', Descripti: 'Распределить элементы по категориям' },
  { PK_TemplateId: 3, TemplateName: 'Найди лишнее', Descripti: 'Определить лишний элемент в группе' },
  { PK_TemplateId: 4, TemplateName: 'Соотнесение', Descripti: 'Соединить изображения со словами' },
];

export const MOCK_TASKS: Task[] = [
  {
    PK_TaskId: 1,
    Title: 'Утренняя рутина',
    Descripti: 'Последовательность действий утренней гигиены. Ребёнок учится выполнять шаги в правильном порядке: проснуться, умыться, почистить зубы, одеться.',
    FK_TemplateId: 1,
    FK_UserId: 1,
    DifficultyLevel: 'Easy',
  },
  {
    PK_TaskId: 2,
    Title: 'Сортировка фруктов',
    Descripti: 'Распределение фруктов по цвету и типу. Задание развивает навыки категоризации и сенсорного восприятия у детей с РАС.',
    FK_TemplateId: 2,
    FK_UserId: 1,
    DifficultyLevel: 'Medium',
  },
  {
    PK_TaskId: 3,
    Title: 'Найди лишнее животное',
    Descripti: 'Определить, какое животное не относится к данной группе. Развивает логическое мышление и коммуникативные навыки.',
    FK_TemplateId: 3,
    FK_UserId: 2,
    DifficultyLevel: 'Hard',
  },
  {
    PK_TaskId: 4,
    Title: 'Эмоции и слова',
    Descripti: 'Соотнести изображения эмоций с их названиями. Помогает развивать социальные навыки и понимание эмоций у детей с РАС.',
    FK_TemplateId: 4,
    FK_UserId: 2,
    DifficultyLevel: 'Easy',
  },
  {
    PK_TaskId: 5,
    Title: 'Собери обед',
    Descripti: 'Выбрать продукты и расположить их на тарелке в правильном порядке. Сенсорная интеграция и последовательность действий.',
    FK_TemplateId: 1,
    FK_UserId: 1,
    DifficultyLevel: 'Medium',
  },
];

export const MOCK_PECS: CatalogPECS[] = [
  { PK_PECSid: 1, Descripti: 'Яблоко', filePath: '/placeholder.svg', Category: 'Еда', UploadDate: '2024-01-15' },
  { PK_PECSid: 2, Descripti: 'Кошка', filePath: '/placeholder.svg', Category: 'Животные', UploadDate: '2024-01-16' },
  { PK_PECSid: 3, Descripti: 'Улыбка', filePath: '/placeholder.svg', Category: 'Эмоции', UploadDate: '2024-02-01' },
  { PK_PECSid: 4, Descripti: 'Рука', filePath: '/placeholder.svg', Category: 'Тело', UploadDate: '2024-02-10' },
];

export const MOCK_MEDIA: MediaCatalog[] = [
  { PK_MediaId: 1, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Фрукты', UploadDate: '2024-03-01' },
  { PK_MediaId: 2, FileType: 'image/png', FilePath: '/placeholder.svg', Descripti: 'Животные', UploadDate: '2024-03-05' },
];

// Mock task-specific items
export const MOCK_FIND_ODD_ITEMS: FindOddOneOutItem[] = [
  { PK_ItemId: 1, FK_TaskId: 3, ItemText: 'Кошка', IsOddOne: false, FK_pecsId: 2 },
  { PK_ItemId: 2, FK_TaskId: 3, ItemText: 'Собака', IsOddOne: false },
  { PK_ItemId: 3, FK_TaskId: 3, ItemText: 'Яблоко', IsOddOne: true, FK_pecsId: 1 },
  { PK_ItemId: 4, FK_TaskId: 3, ItemText: 'Хомяк', IsOddOne: false },
];

export const MOCK_MATCH_PAIRS: MatchImageWordPair[] = [
  { PK_PairId: 1, FK_TaskId: 4, FK_MediaId: 1, FK_pecsId: 3, Words: 'Радость' },
  { PK_PairId: 2, FK_TaskId: 4, FK_MediaId: 2, FK_pecsId: 2, Words: 'Кошка' },
];

export const MOCK_SEQUENCE_ITEMS: SequenceItem[] = [
  { PK_SeqItemId: 1, FK_TaskId: 1, ItemOrder: 1, ItemValue: 'Проснуться', FK_pecsId: 4 },
  { PK_SeqItemId: 2, FK_TaskId: 1, ItemOrder: 2, ItemValue: 'Умыться' },
  { PK_SeqItemId: 3, FK_TaskId: 1, ItemOrder: 3, ItemValue: 'Почистить зубы' },
  { PK_SeqItemId: 4, FK_TaskId: 1, ItemOrder: 4, ItemValue: 'Одеться' },
  { PK_SeqItemId: 5, FK_TaskId: 5, ItemOrder: 1, ItemValue: 'Взять тарелку' },
  { PK_SeqItemId: 6, FK_TaskId: 5, ItemOrder: 2, ItemValue: 'Положить хлеб' },
  { PK_SeqItemId: 7, FK_TaskId: 5, ItemOrder: 3, ItemValue: 'Добавить сыр' },
  { PK_SeqItemId: 8, FK_TaskId: 5, ItemOrder: 4, ItemValue: 'Налить сок' },
];

export const MOCK_SORT_ITEMS: SortItem[] = [
  { PK_SortItemId: 1, FK_TaskId: 2, ItemValue: 'Яблоко', SortKey: 'Красные', FK_pecsId: 1 },
  { PK_SortItemId: 2, FK_TaskId: 2, ItemValue: 'Банан', SortKey: 'Жёлтые' },
  { PK_SortItemId: 3, FK_TaskId: 2, ItemValue: 'Вишня', SortKey: 'Красные' },
  { PK_SortItemId: 4, FK_TaskId: 2, ItemValue: 'Лимон', SortKey: 'Жёлтые' },
];

export const MOCK_TASK_CONSTRUCTIONS: TaskConstruction[] = [
  { PK_ConstructionId: 1, FK_TaskId: 1, ParameterName: 'DifficultyLevel', ParameterValue: 'Easy' },
  { PK_ConstructionId: 2, FK_TaskId: 1, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 3, FK_TaskId: 2, ParameterName: 'DifficultyLevel', ParameterValue: 'Medium' },
  { PK_ConstructionId: 4, FK_TaskId: 2, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 5, FK_TaskId: 3, ParameterName: 'DifficultyLevel', ParameterValue: 'Hard' },
  { PK_ConstructionId: 6, FK_TaskId: 3, ParameterName: 'ShowHints', ParameterValue: 'false' },
  { PK_ConstructionId: 7, FK_TaskId: 4, ParameterName: 'DifficultyLevel', ParameterValue: 'Easy' },
  { PK_ConstructionId: 8, FK_TaskId: 4, ParameterName: 'ShowHints', ParameterValue: 'true' },
  { PK_ConstructionId: 9, FK_TaskId: 5, ParameterName: 'DifficultyLevel', ParameterValue: 'Medium' },
  { PK_ConstructionId: 10, FK_TaskId: 5, ParameterName: 'ShowHints', ParameterValue: 'true' },
];
