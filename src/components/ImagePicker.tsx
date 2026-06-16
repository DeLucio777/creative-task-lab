import React, { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, ImageIcon } from 'lucide-react';

export interface ImagePickerOption {
  id: number;
  label: string;
  sublabel?: string;
  filePath?: string;
}

interface Props {
  value?: number;
  options: ImagePickerOption[];
  onChange: (id: number) => void;
  placeholder?: string;
}

/**
 * Кастомный выпадающий список с миниатюрами картинок.
 * Используется для выбора PECS / медиа в редакторе заданий —
 * чтобы при добавлении элементов с картинками было видно превью.
 */
const ImagePicker: React.FC<Props> = ({ value, options, onChange, placeholder = 'Выберите...' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = value ? options.find(o => o.id === value) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o =>
      o.label.toLowerCase().includes(q) || (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const renderThumb = (path?: string) =>
    path ? (
      <img
        src={`http://localhost:3000${path}`}
        alt=""
        className="w-10 h-10 object-contain rounded bg-card border border-border shrink-0"
      />
    ) : (
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-2 text-sm rounded-xl border-2 border-border bg-card p-2 font-medium hover:border-primary/40 transition-colors text-left"
        >
          {selected ? (
            <>
              {renderThumb(selected.filePath)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{selected.label}</p>
                {selected.sublabel && (
                  <p className="text-xs text-muted-foreground truncate">{selected.sublabel}</p>
                )}
              </div>
            </>
          ) : (
            <span className="flex-1 text-muted-foreground px-1">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[min(420px,90vw)]" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Поиск..."
              className="pl-8 h-9 rounded-lg"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">Ничего не найдено</p>
          ) : (
            filtered.map(o => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    active ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-accent/50'
                  }`}
                >
                  {renderThumb(o.filePath)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{o.label}</p>
                    {o.sublabel && <p className="text-xs text-muted-foreground truncate">{o.sublabel}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImagePicker;
