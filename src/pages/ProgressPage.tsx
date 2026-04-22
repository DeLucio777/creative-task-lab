import React, { useState, useEffect, useMemo } from 'react';
import { progressApi, childrenApi, rewardsApi, representativesApi } from '@/services/entitiesApi';
import { useAuth } from '@/contexts/AuthContext';
import type { ProgressRecord, Child, Reward } from '@/types/models';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

const ProgressPage: React.FC = () => {
  const { user, role } = useAuth();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [allowedChildIds, setAllowedChildIds] = useState<number[] | null>(null); // null = все

  // Загружаем доступных детей под текущую роль
  useEffect(() => {
    (async () => {
      const allChildren = await childrenApi.getAll();
      if (role === 'parent' && user) {
        const rep = await representativesApi.getByUserId(user.PK_UserId);
        const my = rep ? allChildren.filter(c => c.FK_RepresentativeId === rep.PK_RepresentativeId) : [];
        setChildren(my);
        setAllowedChildIds(my.map(c => c.PK_ChildId));
        // Автовыбор первого ребёнка
        if (my.length > 0) setSelectedChild(my[0].PK_ChildId);
      } else {
        setChildren(allChildren);
        setAllowedChildIds(null);
      }
      const all = await progressApi.getAll();
      setProgress(all);
    })();
  }, [user, role]);

  useEffect(() => {
    if (selectedChild) rewardsApi.getByChild(selectedChild).then(setRewards);
    else setRewards([]);
  }, [selectedChild]);

  const filtered = useMemo(() => {
    let base = progress;
    // Родитель: показываем только своих детей
    if (allowedChildIds) base = base.filter(p => allowedChildIds.includes(p.FK_ChildId));
    // Конкретный ребёнок
    if (selectedChild) base = base.filter(p => p.FK_ChildId === selectedChild);
    return base;
  }, [progress, selectedChild, allowedChildIds]);

  const totalCorrect = filtered.filter(p => p.IsCorrect).length;
  const totalErrors = filtered.reduce((sum, p) => sum + p.ErrorCount, 0);

  const getChildName = (id: number) => children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;

  const isParent = role === 'parent';

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">🏆 Прогресс обучения</h1>

      {/* Фильтр: для родителя — только переключение между его детьми (если их >1) */}
      {(!isParent || children.length > 1) && (
        <div className="max-w-xs mb-6 space-y-2">
          <Label className="font-semibold text-xs">{isParent ? 'Выберите ребёнка' : 'Фильтр по ребёнку'}</Label>
          <select
            className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium"
            value={selectedChild}
            onChange={e => setSelectedChild(Number(e.target.value))}
          >
            {!isParent && <option value={0}>Все дети</option>}
            {children.map(c => <option key={c.PK_ChildId} value={c.PK_ChildId}>{c.FullName}</option>)}
          </select>
        </div>
      )}

      {isParent && children.length === 1 && (
        <p className="text-sm text-muted-foreground font-semibold mb-6">
          Прогресс ребёнка: <span className="text-foreground">{children[0].FullName}</span>
        </p>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <p className="text-xs text-muted-foreground font-bold mt-1">Ошибок</p>
        </div>
      </div>

      {/* Награды */}
      {selectedChild > 0 && rewards.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-warning" /> Награды</h3>
          <div className="flex gap-2 flex-wrap">
            {rewards.map(r => (
              <div key={r.PK_RewardId} className="bg-card border-2 border-border rounded-xl px-4 py-2 text-center">
                <p className="text-2xl">{r.RewardValue}</p>
                <p className="text-xs text-muted-foreground">{r.RewardType}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* История */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.PK_ProgressId} className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.IsCorrect ? 'bg-accent/50' : 'bg-destructive/10'}`}>
              {p.IsCorrect ? <CheckCircle2 className="h-5 w-5 text-accent-foreground" /> : <XCircle className="h-5 w-5 text-destructive" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{getChildName(p.FK_ChildId)}</p>
              <p className="text-xs text-muted-foreground">
                Ошибок: {p.ErrorCount} • Подсказок: {p.HintsUsed}
                {p.TimeTakenSeconds && ` • Время: ${p.TimeTakenSeconds}с`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(p.CompletedDate).toLocaleDateString('ru')}</p>
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
