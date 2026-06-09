import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import type { CatalogPECS, MediaCatalog } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Image, FileText } from 'lucide-react';
import UploadDialog from '@/components/UploadDialog';

const MediaLibraryPage: React.FC = () => {
  const [tab, setTab] = useState<'pecs' | 'media'>('pecs');
  const [search, setSearch] = useState('');
  const [pecs, setPecs] = useState<CatalogPECS[]>([]);
  const [media, setMedia] = useState<MediaCatalog[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    api.getPecs().then(setPecs);
    api.getMedia().then(setMedia);
  }, []);

  const filteredPecs = pecs.filter(p =>
    !search || p.Descripti?.toLowerCase().includes(search.toLowerCase()) || p.Category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMedia = media.filter(m =>
    !search || m.Descripti?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = useCallback(async (file: File, name: string, category?: string) => {
    if (tab === 'pecs') {
      const result = await api.uploadPecs(file, name, category || 'Общее');
      if (result) setPecs(prev => [...prev, result]);
    } else {
      const result = await api.uploadMedia(file, name);
      if (result) setMedia(prev => [...prev, result]);
    }
    setUploadOpen(false);
  }, [tab]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">🖼️ Библиотека медиа-файлов</h1>
        <Button onClick={() => setUploadOpen(true)} className="gap-2 rounded-xl font-bold h-11 transition-all duration-200 active:scale-[0.98]">
          <Upload className="h-4 w-4" /> Загрузить
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('pecs')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold rounded-xl transition-all ${
              tab === 'pecs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Image className="h-4 w-4" /> PECS
          </button>
          <button
            onClick={() => setTab('media')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold rounded-xl transition-all ${
              tab === 'media' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="h-4 w-4" /> Медиа
          </button>
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
        </div>
      </div>

      {tab === 'pecs' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPecs.map(p => (
            <div key={p.PK_PECSid} className="bg-card border-2 border-border rounded-2xl p-4 text-center hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center mb-3">
                <img src={p.filePath} alt={p.Descripti} className="w-16 h-16 object-contain" />
              </div>
              <p className="text-sm font-bold text-foreground truncate">{p.Descripti}</p>
              <p className="text-xs text-muted-foreground font-medium">{p.Category}</p>
            </div>
          ))}
          <div onClick={() => setUploadOpen(true)} className="bg-muted/20 border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors min-h-[160px]">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-bold">Добавить PECS</p>
          </div>
        </div>
      )}

      {tab === 'media' && ( 
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map(m => (
            <div key={m.PK_MediaId} className="bg-card border-2 border-border rounded-2xl p-4 text-center hover:border-primary/30 hover:shadow-md transition-all duration-200">
              <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center mb-3">
                <img
                    src={`http://localhost:3000${m.FilePath}`}
                    alt={m.Descripti}
                    className="w-full h-full object-contain"
                />
              </div>

              <p className="text-sm font-bold text-foreground truncate">{m.Descripti}</p>
              <p className="text-xs text-muted-foreground font-medium">{m.FileType}</p>
            </div>
          ))}
          <div onClick={() => setUploadOpen(true)} className="bg-muted/20 border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors min-h-[160px]">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-bold">Добавить файл</p>
          </div>
        </div>
      )}

      {uploadOpen && (
        <UploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUpload={handleUpload}
          type={tab}
        />
      )}
    </div>
  );
};

export default MediaLibraryPage;
