import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  difficulty: string[];
  setDifficulty: (v: string[]) => void;
  rasTypes: string[];
  setRasTypes: (v: string[]) => void;
  search: string;
  setSearch: (v: string) => void;
}

const DIFFICULTIES = [
  { value: 'Easy', label: '🟢 Лёгкий' },
  { value: 'Medium', label: '🟡 Средний' },
  { value: 'Hard', label: '🔴 Сложный' },
];

const RAS_TYPES = [
  { value: 'сенсорн', label: 'Сенсорный' },
  { value: 'социальн', label: 'Социальный' },
  { value: 'коммуникатив', label: 'Коммуникативный' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  difficulty, setDifficulty, rasTypes, setRasTypes, search, setSearch,
}) => {
  const [open, setOpen] = useState(false);

  const toggleDifficulty = (val: string) => {
    setDifficulty(difficulty.includes(val) ? difficulty.filter(d => d !== val) : [...difficulty, val]);
  };

  const toggleRas = (val: string) => {
    setRasTypes(rasTypes.includes(val) ? rasTypes.filter(r => r !== val) : [...rasTypes, val]);
  };

  const hasFilters = difficulty.length > 0 || rasTypes.length > 0 || search.length > 0;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.98]"
      >
        <Filter className="h-4 w-4" />
        Фильтры
        {hasFilters && (
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl border-2 border-border p-5 z-50 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-foreground">🔍 Фильтры</h4>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по описанию..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl h-11"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Сложность</p>
              <div className="space-y-2">
                {DIFFICULTIES.map(d => (
                  <div key={d.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`diff-${d.value}`}
                      checked={difficulty.includes(d.value)}
                      onCheckedChange={() => toggleDifficulty(d.value)}
                    />
                    <Label htmlFor={`diff-${d.value}`} className="text-sm cursor-pointer font-semibold">{d.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Типы РАС</p>
              <div className="space-y-2">
                {RAS_TYPES.map(r => (
                  <div key={r.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`ras-${r.value}`}
                      checked={rasTypes.includes(r.value)}
                      onCheckedChange={() => toggleRas(r.value)}
                    />
                    <Label htmlFor={`ras-${r.value}`} className="text-sm cursor-pointer font-semibold">{r.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground font-bold rounded-xl"
                onClick={() => { setDifficulty([]); setRasTypes([]); setSearch(''); }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
