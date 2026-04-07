// Barrel re-export — единая точка входа для API
export { authApi } from './authApi';
export { tasksApi } from './tasksApi';
export { mediaApi } from './mediaApi';
export {
  childrenApi, educatorsApi, representativesApi, sensoryApi,
  assignmentsApi, progressApi, rewardsApi, trajectoriesApi, groupsApi,
} from './entitiesApi';

// Legacy compat — старые импорты `api.*` продолжают работать
import { authApi } from './authApi';
import { tasksApi } from './tasksApi';
import { mediaApi } from './mediaApi';

export const api = {
  ...authApi,
  ...tasksApi,
  ...mediaApi,
};
