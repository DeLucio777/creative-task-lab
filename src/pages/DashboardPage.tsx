import React, { useState, useMemo } from 'react';
import { MOCK_TASKS } from '@/data/mockData';
import TaskCard from '@/components/TaskCard';
import FilterPanel from '@/components/FilterPanel';

const tabs = [
  { id: 'catalog', label: 'Каталог заданий' },
  { id: 'other', label: '...' },
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
        <div className="flex gap-1 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
              <p className="text-muted-foreground text-sm">Задания не найдены</p>
              <p className="text-xs text-muted-foreground mt-1">Попробуйте изменить параметры фильтра</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'other' && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Раздел в разработке
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
