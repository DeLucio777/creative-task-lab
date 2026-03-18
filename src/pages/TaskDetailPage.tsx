import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TASKS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

const difficultyLabels: Record<string, string> = {
  Easy: 'Лёгкий',
  Medium: 'Средний',
  Hard: 'Сложный',
};

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = MOCK_TASKS.find(t => t.PK_TaskId === Number(id));
  const [selectedDifficulty, setSelectedDifficulty] = useState(task?.DifficultyLevel || 'Easy');
  const [started, setStarted] = useState(false);

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Задание не найдено</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/dashboard')}>
          Вернуться
        </Button>
      </div>
    );
  }

  if (started) {
    return (
      <div>
        <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к описанию
        </button>
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border">
            <p className="text-lg font-semibold text-foreground mb-2">{task.Title}</p>
            <p className="text-sm text-muted-foreground">Уровень: {difficultyLabels[selectedDifficulty]}</p>
            <p className="text-xs text-muted-foreground mt-4">Интерактивное задание загружается из редактора...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Каталог заданий
      </button>

      <div className="bg-card rounded-xl border border-border p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-4">{task.Title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{task.Descripti}</p>

        <div className="mb-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Уровень сложности</p>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98] ${
                  selectedDifficulty === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {difficultyLabels[level]}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setStarted(true)}
          className="gap-2 transition-all duration-200 active:scale-[0.98]"
          size="lg"
        >
          <Play className="h-4 w-4" />
          Начать задание
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailPage;
