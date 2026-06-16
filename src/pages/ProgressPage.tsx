import React, { useState, useEffect, useMemo } from 'react';
import { progressApi, childrenApi, achievementsApi } from '@/services/entitiesApi';
import { mediaApi } from '@/services/mediaApi';
import { useAuth } from '@/contexts/AuthContext';
import type { ProgressRecord, Child, UserAchievement, Achievement, MediaCatalog } from '@/types/models';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

const ProgressPage: React.FC = () => {
  const { user, role } = useAuth();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [mediaList, setMediaList] = useState<MediaCatalog[]>([]);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [allowedChildIds, setAllowedChildIds] = useState<number[] | null>(null);

  // -----------------------------
  // Загрузка данных
  // -----------------------------
  useEffect(() => {
    (async () => {
      const [allChildren, allProgress, allAch] = await Promise.all([
        childrenApi.getAll(), progressApi.getAll(), achievementsApi.getAll(),
      ]);

      setAchievements(allAch);
      mediaApi.getMedia().then(setMediaList);

      if (role === 'parent' && user) {
        const me = allChildren.filter(c => c.PK_ChildId === user.PK_UserId);
        setChildren(me);
        setAllowedChildIds(me.map(c => c.PK_ChildId));
        if (me.length > 0) setSelectedChild(me[0].PK_ChildId);
      } else {
        setChildren(allChildren);
        setAllowedChildIds(null);
      }

      setProgress(allProgress);
    })();
  }, [user, role]);

  // -----------------------------
  // Достижения выбранного ребёнка
  // -----------------------------
  useEffect(() => {
    if (selectedChild)
      achievementsApi.getByUser(selectedChild).then(setUserAchievements);
    else
      setUserAchievements([]);
  }, [selectedChild]);

  // -----------------------------
  // Фильтрация прогресса
  // -----------------------------
  const filtered = useMemo(() => {
    let base = progress;

    if (allowedChildIds)
      base = base.filter(p => allowedChildIds.includes(p.user_id));

    if (selectedChild)
      base = base.filter(p => p.user_id === selectedChild);

    return base;
  }, [progress, selectedChild, allowedChildIds]);

  // -----------------------------
  // Итоги (важно!)
  // -----------------------------
  const totalCorrect = filtered.filter(p => p.completed).length;

  const totalErrors = useMemo(() => {
    if (!filtered.length) return 0;

    // Если выбран конкретный ребёнок — берём агрегат из первой строки
    if (selectedChild) {
      return filtered[0].missed_tasks_count ?? 0;
    }

    // Если выбраны все дети — суммируем по уникальным детям
    const byChild = new Map<number, number>();

    filtered.forEach(p => {
      if (!byChild.has(p.user_id)) {
        byChild.set(p.user_id, p.missed_tasks_count ?? 0);
      }
    });

    return Array.from(byChild.values()).reduce((sum, v) => sum + v, 0);
  }, [filtered, selectedChild]);




  const getChildName = (id: number) =>
      children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;

  const achName = (id: number) =>
      achievements.find(a => a.id === id)?.name || `🏅 #${id}`;

  const isParent = role === 'parent';

  // -----------------------------
  // UI
  // -----------------------------
  return (
      <div>
        <div className="page-sticky-header">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">
            🏆 Прогресс обучения
          </h1>

          {(!isParent || children.length > 1) && (
              <div className="max-w-xs space-y-2">
                <Label className="font-semibold text-xs">
                  {isParent ? 'Выберите ребёнка' : 'Фильтр по ребёнку'}
                </Label>

                <select
                    className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium"
                    value={selectedChild}
                    onChange={e => setSelectedChild(Number(e.target.value))}
                >
                  {!isParent && <option value={0}>Все дети</option>}
                  {children.map(c => (
                      <option key={c.PK_ChildId} value={c.PK_ChildId}>
                        {c.FullName}
                      </option>
                  ))}
                </select>
              </div>
          )}

          {isParent && children.length === 1 && (
              <p className="text-sm text-muted-foreground font-semibold">
                Прогресс: <span className="text-foreground">{children[0].FullName}</span>
              </p>
          )}
        </div>
        <div className="mb-6" />


        {/* Карточки статистики */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">

          <div className="bg-card border-2 border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-primary">{filtered.length}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Всего попыток</p>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-accent-foreground">{totalCorrect}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Правильных</p>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-destructive">{totalErrors}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Ошибок (итог)</p>
          </div>

        
        </div>


        {/* Достижения */}
        {selectedChild > 0 && userAchievements.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" /> Достижения
              </h3>

              <div className="flex gap-2 flex-wrap">
                {userAchievements.map(r => (
                    <div key={r.id} className="bg-card border-2 border-border rounded-xl px-4 py-2 text-center">
                      <p className="text-sm font-bold">{achName(r.achivement_id)}</p>
                      {r.earned_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.earned_date).toLocaleDateString('ru')}
                          </p>
                      )}
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Список попыток */}
        <div className="space-y-3">
          {filtered.map(p => (
              <div key={p.id} className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.completed ? 'bg-accent/50' : 'bg-destructive/10'}`}>
                  {p.completed
                      ? <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                      : <XCircle className="h-5 w-5 text-destructive" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{getChildName(p.user_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    Ошибок: {p.missed_tasks_count} • Подсказок: {p.helps_used_count}
                  </p>
                </div>
              </div>
          ))}

          {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-muted-foreground font-bold">Нет данных о прогрессе</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default ProgressPage;
