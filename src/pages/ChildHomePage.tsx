import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { taskListsApi, achievementsApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import { useNavigate } from 'react-router-dom';
import type { TaskList, TaskListItem, Task, Achievement, UserAchievement } from '@/types/models';
import { Trophy, PlayCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ListWithItems {
  list: TaskList;
  items: TaskListItem[];
  tasks: Task[];
}

const ChildHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ListWithItems[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAch, setUserAch] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const lists = await taskListsApi.getByUser(user.PK_UserId);
      const allTasks = await tasksApi.getTasks();
      const result: ListWithItems[] = [];
      for (const list of lists) {
        const items = await taskListsApi.getItemsForUser(list.PK_id, user.PK_UserId);
        const tasks = items.map(i => allTasks.find(t => t.PK_TaskId === i.task_id)).filter(Boolean) as Task[];
        result.push({ list, items, tasks });
      }
      setData(result);
      setAchievements(await achievementsApi.getAll());
      setUserAch(await achievementsApi.getByUser(user.PK_UserId));
      setLoading(false);
    })();
  }, [user]);

  const todayItems = useMemo(() => {
    return data.flatMap(d => d.items.map(i => ({ item: i, list: d.list, task: d.tasks.find(t => t.PK_TaskId === i.task_id) })))
      .filter(x => !x.item.complited);
  }, [data]);

  if (loading) return <div className="text-center py-16"><p className="text-4xl mb-3 animate-bounce">⏳</p><p className="text-muted-foreground font-bold">Загрузка...</p></div>;

  const totalEarned = userAch.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Привет, {user?.first_name || user?.UserLogin}! 👋</h1>
        <p className="text-muted-foreground font-medium mt-1">Сегодня для тебя {todayItems.length} {todayItems.length === 1 ? 'задание' : 'заданий'}</p>
      </div>

      {/* Сегодня */}
      <div>
        <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> На сегодня
        </h2>
        {todayItems.length === 0 ? (
          <div className="bg-accent/30 rounded-2xl border-2 border-dashed border-border p-10 text-center">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-bold text-foreground">Все задания выполнены!</p>
            <p className="text-sm text-muted-foreground mt-1">Молодец, отдохни и возвращайся завтра.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayItems.slice(0, 6).map(({ item, list, task }) => (
              <button
                key={item.id}
                onClick={() => task && navigate(`/task/${task.PK_TaskId}`)}
                className="bg-card border-2 border-border rounded-2xl p-5 text-left hover:border-primary hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <PlayCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{task?.Title || `Задание #${item.task_id}`}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">📚 {list.Title} · шаг {item.position}</p>
                    {list.date_complite && <p className="text-xs text-warning mt-1 font-semibold">⏰ до {new Date(list.date_complite).toLocaleDateString('ru')}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Все цепочки */}
      <div>
        <h2 className="font-bold text-lg text-foreground mb-3">📚 Мои цепочки заданий</h2>
        <div className="space-y-3">
          {data.map(({ list, items, tasks }) => {
            const done = items.filter(i => i.complited).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            return (
              <div key={list.PK_id} className={`bg-card border-2 rounded-2xl p-5 transition-all ${pct === 100 ? 'border-success bg-success/5' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {pct === 100 && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                    <div>
                      <p className="font-bold text-foreground">
                        {list.Title}
                        {pct === 100 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">Выполнено</span>}
                      </p>
                      {list.Descripti && <p className="text-xs text-muted-foreground">{list.Descripti}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">{done}/{items.length}</span>
                </div>
                <Progress value={pct} className="h-2 mb-3" />
                <div className="flex flex-wrap gap-1.5">
                  {items.map(it => {
                    const t = tasks.find(x => x.PK_TaskId === it.task_id);
                    return (
                      <button
                        key={it.id}
                        onClick={() => t && navigate(`/task/${t.PK_TaskId}`)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          it.complited
                            ? 'border-success bg-success/10 text-success'
                            : 'border-border bg-card hover:border-primary text-foreground'
                        }`}
                      >
                        {it.complited && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        {it.position}. {t?.Title || `#${it.task_id}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-4xl mb-2">📭</p>
              <p>Педагог пока не назначил заданий</p>
            </div>
          )}
        </div>
      </div>

      {/* Награды */}
      <div>
        <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" /> Достижения ({totalEarned}/{achievements.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map(a => {
            const earned = userAch.find(ua => ua.achivement_id === a.id);
            return (
              <div key={a.id} className={`border-2 rounded-2xl p-4 text-center transition-all ${earned ? 'border-warning bg-warning/5' : 'border-border opacity-40'}`}>
                <p className="text-4xl mb-2">{earned ? '🏆' : '🔒'}</p>
                <p className="font-bold text-sm text-foreground">{a.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChildHomePage;
