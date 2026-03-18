import React, { useState } from 'react';
import { MOCK_PECS, MOCK_MEDIA } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Image, FileText } from 'lucide-react';

const MediaLibraryPage: React.FC = () => {
  const [tab, setTab] = useState<'pecs' | 'media'>('pecs');
  const [search, setSearch] = useState('');

  const filteredPecs = MOCK_PECS.filter(p =>
    !search || p.Descripti?.toLowerCase().includes(search.toLowerCase()) || p.Category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMedia = MOCK_MEDIA.filter(m =>
    !search || m.Descripti?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Библиотека медиа-файлов</h1>
        <Button className="gap-2 transition-all duration-200 active:scale-[0.98]">
          <Upload className="h-4 w-4" /> Загрузить
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab('pecs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === 'pecs' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="h-4 w-4" /> PECS
          </button>
          <button
            onClick={() => setTab('media')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === 'media' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" /> Медиа
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9" />
        </div>
      </div>

      {tab === 'pecs' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPecs.map(p => (
            <div key={p.PK_PECSid} className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center mb-2">
                <img src={p.filePath} alt={p.Descripti} className="w-12 h-12 object-contain" />
              </div>
              <p className="text-xs font-medium text-foreground truncate">{p.Descripti}</p>
              <p className="text-xs text-muted-foreground">{p.Category}</p>
            </div>
          ))}
          <div className="bg-muted/20 border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors min-h-[140px]">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Добавить PECS</p>
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map(m => (
            <div key={m.PK_MediaId} className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center mb-2">
                <img src={m.FilePath} alt={m.Descripti} className="w-12 h-12 object-contain" />
              </div>
              <p className="text-xs font-medium text-foreground truncate">{m.Descripti}</p>
              <p className="text-xs text-muted-foreground">{m.FileType}</p>
            </div>
          ))}
          <div className="bg-muted/20 border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors min-h-[140px]">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Добавить файл</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPage;
