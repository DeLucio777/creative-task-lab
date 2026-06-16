import type { CatalogPECS, MediaCatalog } from '@/types/models';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, safe } from './apiClient';

export const mediaApi = {
  getPecs: (): Promise<CatalogPECS[]> => safe(apiGet<CatalogPECS[]>('/api/pecs'), []),
  getMedia: (): Promise<MediaCatalog[]> => safe(apiGet<MediaCatalog[]>('/api/media'), []),
  uploadPecs: (file: File, description: string, category: string): Promise<CatalogPECS | null> =>
    safe(apiUpload<CatalogPECS>('/api/pecs', file, { description, category }), null),
  uploadMedia: (file: File, description: string): Promise<MediaCatalog | null> =>
    safe(apiUpload<MediaCatalog>('/api/media', file, { description }), null),
  updatePecs: (id: number, data: Partial<CatalogPECS>): Promise<CatalogPECS | null> =>
    safe(apiPut<CatalogPECS>(`/api/pecs/${id}`, data), null),
  deletePecs: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/pecs/${id}`); return true; } catch { return false; }
  },
  updateMedia: (id: number, data: Partial<MediaCatalog>): Promise<MediaCatalog | null> =>
    safe(apiPut<MediaCatalog>(`/api/media/${id}`, data), null),
  deleteMedia: async (id: number): Promise<boolean> => {
    try { await apiDelete(`/api/media/${id}`); return true; } catch { return false; }
  },
};
