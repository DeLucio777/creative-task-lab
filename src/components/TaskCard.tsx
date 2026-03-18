import React from 'react';
import type { Task } from '@/types/models';
import { MOCK_TEMPLATES } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const difficultyColors: Record<string, string> = {
  Easy: 'bg-accent text-accent-foreground',
  Medium: 'bg-secondary text-secondary-foreground',
  Hard: 'bg-destructive/10 text-destructive',
};

const difficultyLabels: Record<string, string> = {
  Easy: '🟢 Лёгкий',
  Medium: '🟡 Средний',
  Hard: '🔴 Сложный',
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const navigate = useNavigate();
  const template = MOCK_TEMPLATES.find(t => t.PK_TemplateId === task.FK_TemplateId);

  return (
    <div
      onClick={() => navigate(`/task/${task.PK_TaskId}`)}
      className="group relative bg-card p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 border-border hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-foreground text-base">{task.Title}</h3>
        {task.DifficultyLevel && (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${difficultyColors[task.DifficultyLevel]}`}>
            {difficultyLabels[task.DifficultyLevel]}
          </span>
        )}
      </div>
      {template && (
        <p className="text-xs font-semibold text-primary mb-2">📋 {template.TemplateName}</p>
      )}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{task.Descripti}</p>
    </div>
  );
};

export default TaskCard;
