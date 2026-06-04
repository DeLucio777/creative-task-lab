import type { CatalogPECS, MediaCatalog } from '@/types/models';
import { apiGet, apiUpload, safe } from './apiClient';

export const mediaApi = {
  getPecs: (): Promise<CatalogPECS[]> => safe(apiGet<CatalogPECS[]>('/api/pecs'), []),
  getMedia: (): Promise<MediaCatalog[]> => safe(apiGet<MediaCatalog[]>('/api/media'), []),
  uploadPecs: (file: File, description: string, category: string): Promise<CatalogPECS | null> =>
    safe(apiUpload<CatalogPECS>('/api/pecs', file, { description, category }), null),
  uploadMedia: (file: File, description: string): Promise<MediaCatalog | null> =>
    safe(apiUpload<MediaCatalog>('/api/media', file, { description }), null),
};
