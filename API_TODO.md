# TODO: API-несостыковки frontend ↔ backend

Дата анализа: 2026-06-14  
Frontend: `D:\Diplom\Test\creative-task-lab`  
Backend: `D:\Diplom\DiplomProject\server`

## Критичные несостыковки

- [ ] **`/api/progress` отсутствует на backend.**
  - Frontend вызывает `progressApi.getAll()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:168) и использует его в [`ReportsPage.tsx`](src/pages/ReportsPage.tsx:123) и [`ProgressPage.tsx`](src/pages/ProgressPage.tsx:19).
  - Backend не регистрирует route `/api/progress`: список подключенных API виден в [`../DiplomProject/server/server.ts`](../DiplomProject/server/server.ts:47).
  - Модель прогресса — legacy: [`src/types/models.ts`](src/types/models.ts:172), но в предоставленной SQL-схеме нет `tbl_Progress`/`tbl_Assignment`.

- [ ] **`/api/group-members` отсутствует на backend.**
  - Frontend вызывает `groupsApi.getAllMembers()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:143) и использует его в [`GroupsPage.tsx`](src/pages/GroupsPage.tsx:31), [`ReportsPage.tsx`](src/pages/ReportsPage.tsx:126), [`AssignmentsPage.tsx`](src/pages/AssignmentsPage.tsx:47).
  - Backend имеет только `GET /api/groups/:groupId/members` в [`../DiplomProject/server/src/api/routes/groupsRoute.ts`](../DiplomProject/server/src/api/routes/groupsRoute.ts:13), который возвращает детей группы, а не строки связи `tbl_childrent_to_groups`.

- [ ] **`/api/task-list-items` endpoints отсутствуют на backend.**
  - Frontend вызывает `taskListsApi.getAllItems()`, `markCompleted()` и `markTaskCompletedForUser()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:203).
  - Методы используются в [`TaskDetailPage.tsx`](src/pages/TaskDetailPage.tsx:463), [`AssignmentsPage.tsx`](src/pages/AssignmentsPage.tsx:47) и [`ReportsPage.tsx`](src/pages/ReportsPage.tsx:123).
  - Backend имеет только `GET /api/task-lists/:taskListId/items` в [`../DiplomProject/server/src/api/routes/taskListsRoute.ts`](../DiplomProject/server/src/api/routes/taskListsRoute.ts:16).

- [ ] **`/api/user-achievements` отсутствует на backend.**
  - Frontend вызывает `getAllUserAchievements()` и `award()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:179).
  - Backend имеет только `GET /api/achievements/user/:userId` и `POST /api/achievements/award` в [`../DiplomProject/server/src/api/routes/achievementsRoute.ts`](../DiplomProject/server/src/api/routes/achievementsRoute.ts:7).

- [ ] **`POST /api/pecs` отсутствует на backend.**
  - Frontend вызывает `mediaApi.uploadPecs()` через [`src/services/mediaApi.ts`](src/services/mediaApi.ts:7), используется в [`MediaLibraryPage.tsx`](src/pages/MediaLibraryPage.tsx:30).
  - Backend `pecsRoute` имеет только `GET /api/pecs` и `GET /api/pecs/:id` в [`../DiplomProject/server/src/api/routes/pecsRoute.ts`](../DiplomProject/server/src/api/routes/pecsRoute.ts:7).

- [ ] **`/api/child-info` отсутствует на backend.**
  - Frontend вызывает `childInfoApi.getAll()` и `childInfoApi.save()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:80).
  - Используется в [`TaskDetailPage.tsx`](src/pages/TaskDetailPage.tsx:452) и [`ProfilePage.tsx`](src/pages/ProfilePage.tsx:67).
  - Backend имеет child-info только под `/api/users/:userId/info`: [`../DiplomProject/server/src/api/routes/usersRoute.ts`](../DiplomProject/server/src/api/routes/usersRoute.ts:16), [`../DiplomProject/server/src/api/controllers/UserInfoController.ts`](../DiplomProject/server/src/api/controllers/UserInfoController.ts:11).

- [ ] **`/api/teacher-info` отсутствует на backend.**
  - Frontend вызывает `teacherInfoApi.getAll()` и `teacherInfoApi.save()` через [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:51).
  - `teacherInfoApi.save()` вызывается из `educatorsApi.update()` в [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:72).
  - Backend не регистрирует отдельный route `/api/teacher-info`.

## Высокий приоритет

- [ ] **Frontend ожидает `PUT/DELETE /api/users/:id`, backend их не имеет.**
  - Frontend: [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:23).
  - Используется в [`ProfilePage.tsx`](src/pages/ProfilePage.tsx:90).
  - Backend users-route поддерживает только GET: [`../DiplomProject/server/src/api/routes/usersRoute.ts`](../DiplomProject/server/src/api/routes/usersRoute.ts:14).
  - `UserController` имеет только `getAll/getById`: [`../DiplomProject/server/src/api/controllers/UserController.ts`](../DiplomProject/server/src/api/controllers/UserController.ts:11).

- [ ] **Frontend ожидает, что `/api/auth/register` создаст `tbl_childInfo`/`tbl_teacherInfo`, backend этого не делает.**
  - Frontend-комментарий в [`src/services/authApi.ts`](src/services/authApi.ts:29).
  - Backend `AuthController.register()` создаёт только `tbl_User`: [`../DiplomProject/server/src/api/controllers/AuthController.ts`](../DiplomProject/server/src/api/controllers/AuthController.ts:34).
  - `UserService.create()` тоже создаёт только `tbl_User`: [`../DiplomProject/server/src/services/UserService.ts`](../DiplomProject/server/src/services/UserService.ts:27).

- [ ] **Payload для обновления ребёнка не совпадает.**
  - Frontend отправляет `FullName`, `email`, `phone`, `age`, `speak_level`, `FK_disease_id` в [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:119).
  - Используется в [`ChildrenPage.tsx`](src/pages/ChildrenPage.tsx:84) и [`ChildrenPage.tsx`](src/pages/ChildrenPage.tsx:117).
  - Backend `ChildrenRepository.update()` ожидает `Child` с `ChildInfo` и полями `first_name/second_name`: [`../DiplomProject/server/src/repositories/ChildrenRepository.ts`](../DiplomProject/server/src/repositories/ChildrenRepository.ts:89).

- [ ] **Payload для обновления педагога не совпадает.**
  - Frontend отправляет `FullName`, `Specialization`, `Phone`, `Email` в [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:66).
  - Используется в [`EducatorsPage.tsx`](src/pages/EducatorsPage.tsx:48) и [`ProfilePage.tsx`](src/pages/ProfilePage.tsx:94).
  - Backend `EducatorsRepository.update()` обновляет только `Teacher_Specialization` в `tbl_teacherInfo`: [`../DiplomProject/server/src/repositories/EducatorsRepository.ts`](../DiplomProject/server/src/repositories/EducatorsRepository.ts:99).

- [ ] **Payload создания task list не совпадает.**
  - Frontend отправляет плоский объект `{ Title, Descripti, teacher_id, date_complite, taskIds, userIds }` в [`src/pages/AssignmentsPage.tsx`](src/pages/AssignmentsPage.tsx:121).
  - Тип `TaskListCreate` описан в [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:191).
  - Backend `TaskListsController.create()` ожидает `{ taskList, taskIds, userIds }`: [`../DiplomProject/server/src/api/controllers/TaskListsController.ts`](../DiplomProject/server/src/api/controllers/TaskListsController.ts:50).
  - `tbl_task_list` не содержит `Title/Descripti`, backend вставляет только `PK_id`, `date_complite`, `teacher_id`: [`../DiplomProject/server/src/repositories/TaskListsRepository.ts`](../DiplomProject/server/src/repositories/TaskListsRepository.ts:85).

- [ ] **Publish task: frontend и backend используют разные имена поля.**
  - Frontend отправляет `{ public_task: published }` в [`src/services/tasksApi.ts`](src/services/tasksApi.ts:52).
  - Backend `TaskController.publish()` ожидает `{ published }`: [`../DiplomProject/server/src/api/controllers/taskController.ts`](../DiplomProject/server/src/api/controllers/taskController.ts:153).
  - Backend возвращает `{ success: true }`, frontend просто проверяет `r !== null`: [`src/services/tasksApi.ts`](src/services/tasksApi.ts:52).

- [ ] **Group membership API-контракт не совпадает.**
  - Frontend `addMember()` вызывает `/api/group-members` и отправляет `{ FK_group_id, FK_user_id }`: [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:160).
  - Frontend `removeMember(memberId)` удаляет по id связи: [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:162).
  - Backend ожидает `POST /api/groups/:groupId/members` с `{ userId }` и возвращает `204`: [`../DiplomProject/server/src/api/routes/groupsRoute.ts`](../DiplomProject/server/src/api/routes/groupsRoute.ts:22), [`../DiplomProject/server/src/api/controllers/GroupsController.ts`](../DiplomProject/server/src/api/controllers/GroupsController.ts:63).
  - Backend удаляет по `groupId + userId`, а не по `memberId`: [`../DiplomProject/server/src/api/routes/groupsRoute.ts`](../DiplomProject/server/src/api/routes/groupsRoute.ts:25).

## Средний/низкий приоритет

- [ ] **Frontend экспортирует unused item-list endpoints, которых нет на backend.**
  - `getAllConstructions`, `getAllFindOddItems`, `getAllMatchPairs`, `getAllSequenceItems`, `getAllSortItems` объявлены в [`src/services/tasksApi.ts`](src/services/tasksApi.ts:21).
  - Backend имеет только task-scoped endpoints: [`../DiplomProject/server/src/api/routes/tasksRoute.ts`](../DiplomProject/server/src/api/routes/tasksRoute.ts:13).

- [ ] **`TaskList` type содержит поля, которых нет в backend/API.**
  - `Title` и `Descripti` есть в frontend-типе [`src/types/models.ts`](src/types/models.ts:155).
  - Backend-сущность/repo используют только `PK_id`, `date_complite`, `teacher_id`: [`../DiplomProject/server/src/entities/taskList.ts`](../DiplomProject/server/src/entities/taskList.ts:1), [`../DiplomProject/server/src/repositories/TaskListsRepository.ts`](../DiplomProject/server/src/repositories/TaskListsRepository.ts:11).

- [ ] **`UserAchievement` type содержит поле, которого нет в БД.**
  - Frontend ожидает `earned_date` в [`src/types/models.ts`](src/types/models.ts:191).
  - SQL-схема `tbl_users_achievement` содержит только `id`, `achivement_id`, `user_id`.

- [ ] **`ProgressRecord` model не соответствует предоставленной БД.**
  - Frontend-модель: [`src/types/models.ts`](src/types/models.ts:172).
  - В SQL-схеме нет `tbl_Progress`/`tbl_Assignment`, а backend route `/api/progress` отсутствует.

- [ ] **PECS upload: если добавлять endpoint, нужно согласовать имена полей.**
  - Frontend отправляет `description` и `category` в [`src/services/mediaApi.ts`](src/services/mediaApi.ts:7).
  - SQL-колонки: `Descripti`, `filePath`, `Category`; backend-репозиторий ожидает `Descripti`/`Category` в [`../DiplomProject/server/src/repositories/PECSRepository.ts`](../DiplomProject/server/src/repositories/PECSRepository.ts:29).

- [ ] **Проверка уникальности логина реализована через `/api/users`.**
  - Frontend `usersApi.isLoginTaken()` и `authApi.isLoginTaken()` получают всех пользователей: [`src/services/entitiesApi.ts`](src/services/entitiesApi.ts:31), [`src/services/authApi.ts`](src/services/authApi.ts:16).
  - Backend уже имеет `findByLogin()` в [`../DiplomProject/server/src/repositories/UserRepository.ts`](../DiplomProject/server/src/repositories/UserRepository.ts:55), но route для неё не зарегистрирован.

## Рекомендуемые варианты исправления

- [ ] **Выбрать единый API-контракт:** либо добавить недостающие backend endpoints под frontend (`/api/child-info`, `/api/teacher-info`, `/api/group-members`, `/api/task-list-items`, `/api/user-achievements`, `/api/progress`, `POST /api/pecs`), либо переписать frontend service layer под уже существующие backend routes.
- [ ] **Для child/teacher info:** использовать существующий `/api/users/:userId/info` для child-info или добавить отдельные endpoints `/api/child-info` и `/api/teacher-info`.
- [ ] **Для task-list items:** добавить backend endpoints под frontend (`GET /api/task-list-items`, `PUT /api/task-list-items/:id/complete`, `POST /api/task-list-items/complete-for-user`) или заменить frontend на `/api/task-lists/:id/items`.
- [ ] **Для achievements:** заменить frontend `getAllUserAchievements()` на `/api/achievements/user/:userId` и `award()` на `/api/achievements/award`.
- [ ] **Для progress:** либо реализовать реальный backend под `tbl_childInfo`-статистику, либо удалить/скрыть legacy `ProgressPage`/`progressApi`.
- [ ] **Для groups:** либо добавить `/api/group-members` на backend, либо переписать `groupsApi.getAllMembers/addMember/removeMember` под `/api/groups/:groupId/members`.
- [ ] **Для task publish:** синхронизировать поле: frontend должен отправлять `{ published }` либо backend должен принимать `{ public_task }`.
- [ ] **Для task list create:** либо backend должен принимать плоский payload frontend, либо frontend должен отправлять `{ taskList: {...}, taskIds, userIds }`.
- [ ] **Для users update/delete:** добавить `PUT/DELETE /api/users/:id` на backend либо убрать frontend-методы и связанные UI-действия.
- [ ] **Для PECS upload:** добавить `POST /api/pecs` с multer upload и полями `description`/`category`, либо убрать загрузку PECS из frontend.
