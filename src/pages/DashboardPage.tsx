import React, { useState, useMemo } from 'react';
import { MOCK_TASKS, MOCK_TEMPLATES } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import FilterPanel from '@/components/FilterPanel';

const tabs = [
  { id: 'catalog', label: '📚 Каталог заданий' },
  { id: 'other', label: '📌 Другое' },
];

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [rasTypes, setRasTypes] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return MOCK_TASKS.filter(t => {
      if (difficulty.length > 0 && t.DifficultyLevel && !difficulty.includes(t.DifficultyLevel)) return false;
      if (search && !(t.Descripti?.toLowerCase().includes(search.toLowerCase()) || t.Title.toLowerCase().includes(search.toLowerCase()))) return false;
      if (rasTypes.length > 0 && t.Descripti) {
        const desc = t.Descripti.toLowerCase();
        if (!rasTypes.some(r => desc.includes(r))) return false;
      }
      if (rasTypes.length > 0 && !t.Descripti) return false;
      return true;
    });
  }, [difficulty, rasTypes, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <FilterPanel
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          rasTypes={rasTypes}
          setRasTypes={setRasTypes}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {activeTab === 'catalog' && (
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

      {activeTab === 'other' && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-muted-foreground font-bold">Раздел в разработке</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
