// Barrel — единая точка входа
export { authApi } from './authApi';
export { tasksApi } from './tasksApi';
export { mediaApi } from './mediaApi';
export {
  childrenApi, educatorsApi, groupsApi,
  achievementsApi, taskListsApi, diseasesApi,
  childInfoApi, teacherInfoApi, progressApi, usersApi,
  splitFullName, ROLE_ID,
} from './entitiesApi';

// Legacy compat
import { authApi } from './authApi';
import { tasksApi } from './tasksApi';
import { mediaApi } from './mediaApi';

export const api = {
  ...authApi,
  ...tasksApi,
  ...mediaApi,
};
