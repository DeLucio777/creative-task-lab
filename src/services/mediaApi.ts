import type { CatalogPECS, MediaCatalog } from '@/types/models';
import { apiFetch, apiUpload } from './apiClient';
import { MOCK_PECS, MOCK_MEDIA } from '@/data/mockData';

export const mediaApi = {
  getPecs: () => apiFetch<CatalogPECS[]>('/api/pecs', MOCK_PECS),
  getMedia: () => apiFetch<MediaCatalog[]>('/api/media', MOCK_MEDIA),

  uploadPecs: async (file: File, description: string, category: string): Promise<CatalogPECS | null> => {
    const result = await apiUpload<CatalogPECS>('/api/pecs', file, { description, category });
    if (result) return result;
    const url = URL.createObjectURL(file);
    const newPecs: CatalogPECS = {
      PK_PECSid: Date.now(), Descripti: description, filePath: url,
      Category: category, UploadDate: new Date().toISOString(),
    };
    MOCK_PECS.push(newPecs);
    return newPecs;
  },

  uploadMedia: async (file: File, description: string): Promise<MediaCatalog | null> => {
    const result = await apiUpload<MediaCatalog>('/api/media', file, { description });
    if (result) return result;
    const url = URL.createObjectURL(file);
    const newMedia: MediaCatalog = {
      PK_MediaId: Date.now(), FileType: file.type, FilePath: url,
      Descripti: description, UploadDate: new Date().toISOString(),
    };
    MOCK_MEDIA.push(newMedia);
    return newMedia;
  },
};
