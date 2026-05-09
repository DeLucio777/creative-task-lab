import React, { useState, useMemo, useEffect } from 'react';
import { api } from '@/services/api';
import type { Task } from '@/types/models';
import TaskCard from '@/components/TaskCard';
import FilterPanel from '@/components/FilterPanel';

const DashboardPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [rasTypes, setRasTypes] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTasks().then(data => {
      setTasks(data.filter(t => t.IsPublished));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (difficulty.length > 0 && t.DifficultyLevel && !difficulty.includes(t.DifficultyLevel)) return false;
      if (search && !(t.Descripti?.toLowerCase().includes(search.toLowerCase()) || t.Title.toLowerCase().includes(search.toLowerCase()))) return false;
      if (rasTypes.length > 0 && t.Descripti) {
        const desc = t.Descripti.toLowerCase();
        if (!rasTypes.some(r => desc.includes(r))) return false;
      }
      if (rasTypes.length > 0 && !t.Descripti) return false;
      return true;
    });
  }, [tasks, difficulty, rasTypes, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 sm:mb-8">
        <FilterPanel
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          rasTypes={rasTypes}
          setRasTypes={setRasTypes}
          search={search}
          setSearch={setSearch}
        />
      </div>

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
