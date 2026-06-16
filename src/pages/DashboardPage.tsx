import React, { useState, useMemo, useEffect } from 'react';
import { api } from '@/services/api';
import type { Task } from '@/types/models';
import TaskCard from '@/components/TaskCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const DIFFICULTIES = [
  { value: 'Easy', label: '🟢 Лёгкий' },
  { value: 'Medium', label: '🟡 Средний' },
  { value: 'Hard', label: '🔴 Сложный' },
];

const DashboardPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTasks().then(data => {
      setTasks(data.filter(t => t.public_task));
      setLoading(false);
    });
  }, []);

  const toggleDifficulty = (v: string) =>
    setDifficulty(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter(t => {
      if (difficulty.length > 0 && t.DifficultyLevel && !difficulty.includes(t.DifficultyLevel)) return false;
      if (difficulty.length > 0 && !t.DifficultyLevel) return false;
      if (q && !t.Title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, difficulty, search]);

  return (
    <div>
      <div className="page-sticky-header">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="pl-9 rounded-xl h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map(d => {
              const active = difficulty.includes(d.value);
              return (
                <button
                  key={d.value}
                  onClick={() => toggleDifficulty(d.value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
            {(difficulty.length > 0 || search) && (
              <button
                onClick={() => { setDifficulty([]); setSearch(''); }}
                className="px-3.5 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground"
              >
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mb-6 sm:mb-8" />


      {loading ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3 animate-bounce">⏳</p>
          <p className="text-muted-foreground font-bold">Загрузка...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map(task => <TaskCard key={task.PK_TaskId} task={task} />)
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-muted-foreground font-bold">Задания не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">Попробуйте изменить параметры фильтра</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
