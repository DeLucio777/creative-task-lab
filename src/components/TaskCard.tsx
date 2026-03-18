import React from 'react';
import type { Task } from '@/types/models';
import { useNavigate } from 'react-router-dom';

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  Hard: 'bg-rose-50 text-rose-700',
};

const difficultyLabels: Record<string, string> = {
  Easy: 'Лёгкий',
  Medium: 'Средний',
  Hard: 'Сложный',
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/task/${task.PK_TaskId}`)}
      className="group relative bg-card p-5 rounded-xl cursor-pointer transition-all duration-200 border border-border hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-foreground">{task.Title}</h3>
        {task.DifficultyLevel && (
          <span className={`px-2 py-1 text-xs font-medium rounded-md ${difficultyColors[task.DifficultyLevel]}`}>
            {difficultyLabels[task.DifficultyLevel]}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{task.Descripti}</p>
    </div>
  );
};

export default TaskCard;
