import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TASKS, MOCK_TEMPLATES } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';

const difficultyLabels: Record<string, { label: string; emoji: string }> = {
  Easy: { label: 'Лёгкий', emoji: '🟢' },
  Medium: { label: 'Средний', emoji: '🟡' },
  Hard: { label: 'Сложный', emoji: '🔴' },
};

const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = MOCK_TASKS.find(t => t.PK_TaskId === Number(id));
  const template = task ? MOCK_TEMPLATES.find(t => t.PK_TemplateId === task.FK_TemplateId) : null;
  const [selectedDifficulty, setSelectedDifficulty] = useState(task?.DifficultyLevel || 'Easy');
  const [started, setStarted] = useState(false);

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-muted-foreground font-bold">Задание не найдено</p>
        <Button variant="ghost" className="mt-4 font-bold" onClick={() => navigate('/dashboard')}>
          Вернуться
        </Button>
      </div>
    );
  }

  if (started) {
    return (
      <div>
        <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к описанию
        </button>
        <div className="bg-card rounded-2xl border-2 border-border p-8">
          <div className="text-center py-16 bg-accent/30 rounded-xl border-2 border-dashed border-border">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-lg font-bold text-foreground mb-2">{task.Title}</p>
            <p className="text-sm text-muted-foreground font-medium">
              {difficultyLabels[selectedDifficulty].emoji} Уровень: {difficultyLabels[selectedDifficulty].label}
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-medium">Интерактивное задание загружается из редактора...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Каталог заданий
      </button>

      <div className="bg-card rounded-2xl border-2 border-border p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{task.Title}</h1>
        {template && (
          <p className="text-sm font-bold text-primary mb-4">📋 {template.TemplateName}</p>
        )}
        <p className="text-muted-foreground leading-relaxed mb-8 font-medium">{task.Descripti}</p>

        <div className="mb-8">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Уровень сложности</p>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] ${
                  selectedDifficulty === level
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {difficultyLabels[level].emoji} {difficultyLabels[level].label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setStarted(true)}
          className="gap-2 h-12 text-base font-bold rounded-xl transition-all duration-200 active:scale-[0.98]"
          size="lg"
        >
          <Play className="h-5 w-5" />
          Начать задание
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailPage;
