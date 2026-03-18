import type { Task, TaskTemplate, CatalogPECS, MediaCatalog, User, Role } from '@/types/models';

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
