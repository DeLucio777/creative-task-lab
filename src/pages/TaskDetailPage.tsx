import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle, Timer, Trash2, Lightbulb, Pencil, ArrowRight, Home } from 'lucide-react';
import { api } from '@/services/api';
import { taskListsApi, childInfoApi } from '@/services/entitiesApi';
import { useAuth } from '@/contexts/AuthContext';
import type { Task, TaskTemplate, FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, CatalogPECS, TaskConstruction, Achievement } from '@/types/models';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const difficultyLabels: Record<string, { label: string; emoji: string }> = {
  Easy: { label: 'Лёгкий', emoji: '🟢' },
  Medium: { label: 'Средний', emoji: '🟡' },
  Hard: { label: 'Сложный', emoji: '🔴' },
};

// Template ID → task type mapping
const templateToType: Record<number, string> = {
  1: 'find_odd',
  2: 'match_image_word',
  3: 'sequence',
  4: 'sort',
};

// --- Interactive game components ---

// Палитра для подсветки разных пар в задании "сопоставление"
const PAIR_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];

const FindOddGame: React.FC<{ items: FindOddOneOutItem[]; pecsList: CatalogPECS[]; onComplete: (correct: boolean) => void }> = ({ items, pecsList, onComplete }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (itemId: number) => {
    if (answered) return;
    setSelected(itemId);
  };

  const handleCheck = () => {
    if (selected === null) return;
    const item = items.find(i => i.PK_ItemId === selected);
    setAnswered(true);
    setTimeout(() => onComplete(item?.IsOddOne === true), 1500);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-lg font-bold text-foreground">Найди лишний элемент! 🔍</p>
      <div className="grid grid-cols-2 gap-4">
        {items.map(item => {
          const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
          const isSelected = selected === item.PK_ItemId;
          const isCorrect = answered && item.IsOddOne;
          const isWrong = answered && isSelected && !item.IsOddOne;

          return (
            <button
              key={item.PK_ItemId}
              onClick={() => handleSelect(item.PK_ItemId)}
              className={`p-4 rounded-2xl border-3 text-center transition-all duration-300 active:scale-[0.95] flex flex-col items-center ${
                isCorrect ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200/50' :
                isWrong ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50' :
                isSelected ? 'border-primary bg-primary/5 shadow-md' :
                'border-border bg-card hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              {pecs ? (
                <div className="w-full aspect-square bg-muted/20 rounded-xl flex items-center justify-center mb-2 p-2">
                  <img src={`http://localhost:3000${pecs.filePath}`} alt={pecs.Descripti} className="max-w-full max-h-full object-contain" />
                </div>
              ) : null}
              <p className={`font-bold ${pecs ? 'text-sm' : 'text-2xl py-8'}`}>{item.ItemText}</p>
              {answered && isCorrect && <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mt-2" />}
              {answered && isWrong && <XCircle className="h-6 w-6 text-red-500 mx-auto mt-2" />}
            </button>
          );
        })}
      </div>
      {!answered && (
        <Button onClick={handleCheck} disabled={selected === null} className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
          ✅ Проверить
        </Button>
      )}
    </div>
  );
};

const MatchGame: React.FC<{ pairs: MatchImageWordPair[]; pecsList: CatalogPECS[]; onComplete: (correct: boolean) => void }> = ({ pairs, pecsList, onComplete }) => {
  const shuffledWords = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  // matches[imagePairId] = wordPairId
  const [matches, setMatches] = useState<Record<number, number>>({});
  // pairColors[imagePairId] = цвет, общий для картинки и её слова
  const [pairColors, setPairColors] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const handleWordClick = (wordPairId: number) => {
    if (checked || selectedImage === null) return;
    setMatches(prev => ({ ...prev, [selectedImage]: wordPairId }));
    setPairColors(prev => {
      if (prev[selectedImage]) return prev;
      const usedCount = Object.keys(prev).length;
      return { ...prev, [selectedImage]: PAIR_COLORS[usedCount % PAIR_COLORS.length] };
    });
    setSelectedImage(null);
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = pairs.every(p => matches[p.PK_PairId] === p.PK_PairId);
    setTimeout(() => onComplete(allCorrect), 2000);
  };

  // Найти цвет для слова: ищем картинку, к которой это слово привязано
  const colorForWord = (wordPairId: number): string | undefined => {
    const imgId = Object.entries(matches).find(([, w]) => w === wordPairId)?.[0];
    return imgId ? pairColors[Number(imgId)] : undefined;
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <div className="space-y-6">
      <p className="text-center text-lg font-bold text-foreground">Соедини картинку и слово! 🖼️</p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Картинки</p>
          {pairs.map(pair => {
            const pecs = pair.FK_pecsId ? pecsList.find(p => p.PK_PECSid === pair.FK_pecsId) : null;
            const isSelected = selectedImage === pair.PK_PairId;
            const isMatched = matches[pair.PK_PairId] !== undefined;
            const isCorrect = checked && matches[pair.PK_PairId] === pair.PK_PairId;
            const isWrong = checked && isMatched && matches[pair.PK_PairId] !== pair.PK_PairId;
            const color = pairColors[pair.PK_PairId];
            const style = !checked && color
              ? { borderColor: color, backgroundColor: `${color}22` }
              : undefined;

            return (
              <button
                key={pair.PK_PairId}
                onClick={() => !checked && setSelectedImage(pair.PK_PairId)}
                style={style}
                className={`w-full p-4 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center ${
                  isCorrect ? 'border-green-400 bg-green-50' :
                  isWrong ? 'border-red-400 bg-red-50' :
                  isSelected && !color ? 'border-primary bg-primary/5 shadow-md' :
                  !isMatched && !color ? 'border-border bg-card hover:border-primary/30' : ''
                }`}
              >
                {pecs
                  ? <img src={`http://localhost:3000${pecs.filePath}`} alt="" className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-xl" />
                  : <div className="w-32 h-32 sm:w-40 sm:h-40 bg-muted rounded-xl flex items-center justify-center text-5xl">🖼️</div>}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Слова</p>
          {shuffledWords.map(pair => {
            const isUsed = Object.values(matches).includes(pair.PK_PairId);
            const color = colorForWord(pair.PK_PairId);
            const style = !checked && color
              ? { borderColor: color, backgroundColor: `${color}22` }
              : undefined;
            return (
              <button
                key={pair.PK_PairId}
                onClick={() => handleWordClick(pair.PK_PairId)}
                disabled={isUsed || checked}
                style={style}
                className={`w-full p-4 rounded-2xl border-4 text-base font-bold transition-all duration-200 ${
                  !color && isUsed ? 'border-accent bg-accent/30 text-accent-foreground' :
                  !color ? 'border-border bg-card hover:border-primary/30 text-foreground' : 'text-foreground'
                }`}
              >
                {pair.Words}
              </button>
            );
          })}
        </div>
      </div>
      {!checked && allMatched && (
        <Button onClick={handleCheck} className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
          ✅ Проверить
        </Button>
      )}
    </div>
  );
};

const SequenceGame: React.FC<{ items: SequenceItem[]; pecsList: CatalogPECS[]; onComplete: (correct: boolean) => void }> = ({ items, pecsList, onComplete }) => {
  const correctOrder = useMemo(() => [...items].sort((a, b) => a.ItemOrder - b.ItemOrder), [items]);
  const shuffled = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items]);
  const [userOrder, setUserOrder] = useState<SequenceItem[]>([]);
  const [remaining, setRemaining] = useState<SequenceItem[]>(shuffled);
  const [checked, setChecked] = useState(false);

  const addItem = (item: SequenceItem) => {
    if (checked) return;
    setUserOrder(prev => [...prev, item]);
    setRemaining(prev => prev.filter(i => i.PK_SeqItemId !== item.PK_SeqItemId));
  };

  const removeItem = (item: SequenceItem) => {
    if (checked) return;
    setUserOrder(prev => prev.filter(i => i.PK_SeqItemId !== item.PK_SeqItemId));
    setRemaining(prev => [...prev, item]);
  };

  const handleCheck = () => {
    setChecked(true);
    const isCorrect = userOrder.every((item, idx) => item.PK_SeqItemId === correctOrder[idx].PK_SeqItemId);
    setTimeout(() => onComplete(isCorrect), 2000);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-lg font-bold text-foreground">Расставь по порядку! 🔢</p>

      <div className="min-h-[80px] bg-accent/30 rounded-2xl border-2 border-dashed border-border p-4">
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Твой ответ:</p>
        <div className="flex flex-wrap gap-2">
          {userOrder.map((item, idx) => {
            const isCorrect = checked && item.PK_SeqItemId === correctOrder[idx]?.PK_SeqItemId;
            const isWrong = checked && !isCorrect;
            const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
            return (
              <button
                key={item.PK_SeqItemId}
                onClick={() => removeItem(item)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 font-bold transition-all ${
                  isCorrect ? 'border-green-400 bg-green-50 text-green-700' :
                  isWrong ? 'border-red-400 bg-red-50 text-red-700' :
                  'border-primary bg-primary/5 text-foreground hover:bg-primary/10'
                }`}
              >
                <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                {pecs && <img src={`http://localhost:3000${pecs.filePath}`} alt="" className="w-20 h-20 object-contain rounded" />}
                <span className={pecs ? 'text-xs' : 'text-base'}>{item.ItemValue}</span>
              </button>
            );
          })}
          {userOrder.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Нажимайте на элементы ниже...</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Доступные элементы:</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map(item => {
            const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
            return (
              <button
                key={item.PK_SeqItemId}
                onClick={() => addItem(item)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border bg-card font-bold hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.95]"
              >
                {pecs && <img src={`http://localhost:3000${pecs.filePath}`} alt="" className="w-20 h-20 object-contain rounded" />}
                <span className={pecs ? 'text-xs' : 'text-base'}>{item.ItemValue}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!checked && remaining.length === 0 && userOrder.length > 0 && (
        <Button onClick={handleCheck} className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
          ✅ Проверить
        </Button>
      )}
    </div>
  );
};

const SortGame: React.FC<{ items: SortItem[]; pecsList: CatalogPECS[]; onComplete: (correct: boolean) => void }> = ({ items, pecsList, onComplete }) => {
  const categories = useMemo(() => [...new Set(items.map(i => i.SortKey))], [items]);
  const shuffled = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items]);
  const [buckets, setBuckets] = useState<Record<string, SortItem[]>>(() => {
    const b: Record<string, SortItem[]> = {};
    categories.forEach(c => b[c] = []);
    return b;
  });
  const [remaining, setRemaining] = useState<SortItem[]>(shuffled);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleItemClick = (item: SortItem) => {
    if (checked || !selectedCategory) return;
    setRemaining(prev => prev.filter(i => i.PK_SortItemId !== item.PK_SortItemId));
    setBuckets(prev => ({ ...prev, [selectedCategory]: [...prev[selectedCategory], item] }));
  };

  const removeFromBucket = (category: string, item: SortItem) => {
    if (checked) return;
    setBuckets(prev => ({ ...prev, [category]: prev[category].filter(i => i.PK_SortItemId !== item.PK_SortItemId) }));
    setRemaining(prev => [...prev, item]);
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = Object.entries(buckets).every(([cat, catItems]) =>
      catItems.every(item => item.SortKey === cat)
    );
    setTimeout(() => onComplete(allCorrect), 2000);
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-lg font-bold text-foreground">Распредели по категориям! 📂</p>

      <div className="grid grid-cols-2 gap-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-2xl border-2 p-4 transition-all min-h-[120px] text-left ${
              selectedCategory === cat ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className="text-sm font-bold text-primary mb-3">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {buckets[cat].map(item => {
                const isCorrect = checked && item.SortKey === cat;
                const isWrong = checked && item.SortKey !== cat;
                const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
                return (
                  <button
                    key={item.PK_SortItemId}
                    onClick={(e) => { e.stopPropagation(); removeFromBucket(cat, item); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-bold transition-all ${
                      isCorrect ? 'bg-green-100 text-green-700 border border-green-300' :
                      isWrong ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-muted text-foreground border border-border'
                    }`}
                  >
                    {pecs && <img src={`http://localhost:3000${pecs.filePath}`} alt="" className="w-16 h-16 object-contain rounded" />}
                    {item.ItemValue}
                  </button>
                );
              })}
            </div>
          </button>
        ))}
      </div>

      {remaining.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
            {selectedCategory ? `Нажмите, чтобы добавить в «${selectedCategory}»:` : 'Выберите категорию выше, затем элемент:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {remaining.map(item => {
              const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
              return (
                <button
                  key={item.PK_SortItemId}
                  onClick={() => handleItemClick(item)}
                  disabled={!selectedCategory}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border bg-card font-bold hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.95] disabled:opacity-50"
                >
                  {pecs && <img src={`http://localhost:3000${pecs.filePath}`} alt="" className="w-20 h-20 object-contain rounded" />}
                  <span className={pecs ? 'text-xs' : 'text-base'}>{item.ItemValue}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!checked && remaining.length === 0 && (
        <Button onClick={handleCheck} className="w-full h-14 text-lg font-bold rounded-2xl gap-2">
          ✅ Проверить
        </Button>
      )}
    </div>
  );
};


// --- Main page ---
const TaskDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const taskId = Number(id);

  const [task, setTask] = useState<Task | null>(null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [pecsList, setPecsList] = useState<CatalogPECS[]>([]);
  const [constructions, setConstructions] = useState<TaskConstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | 'timeout' | 'expired' | null>(null);

  // Дедлайн назначения для текущего ребёнка
  const [chainDeadline, setChainDeadline] = useState<Date | null>(null);
  const [chainItemId, setChainItemId] = useState<number | null>(null);

  const isAdmin = role === 'admin';
  const isOwnerEducator = role === 'educator' && task?.FK_UserId === user?.PK_UserId;
  const canEditTask = isAdmin || isOwnerEducator;

  // Подсказка
  const [hintShown, setHintShown] = useState(false);

  // Следующее задание в цепочке
  const [nextInChain, setNextInChain] = useState<{ listId: number; nextTaskId: number; position: number } | null>(null);
  const [awardedAchievements, setAwardedAchievements] = useState<Achievement[]>([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Task-specific data
  const [findOddItems, setFindOddItems] = useState<FindOddOneOutItem[]>([]);
  const [matchPairs, setMatchPairs] = useState<MatchImageWordPair[]>([]);
  const [seqItems, setSeqItems] = useState<SequenceItem[]>([]);
  const [sortItems, setSortItems] = useState<SortItem[]>([]);

  useEffect(() => {
    Promise.all([
      api.getTask(taskId),
      api.getTemplates(),
      api.getPecs(),
      api.getTaskFindOddItems(taskId),
      api.getTaskMatchPairs(taskId),
      api.getTaskSequenceItems(taskId),
      api.getTaskSortItems(taskId),
      api.getTaskConstructions(taskId),
    ]).then(([t, tmpl, pecs, odd, match, seq, sort, constr]) => {
      setTask(t);
      setTemplates(tmpl);
      setPecsList(pecs);
      setFindOddItems(odd);
      setMatchPairs(match);
      setSeqItems(seq);
      setSortItems(sort);
      setConstructions(constr);
      setLoading(false);
    });
  }, [taskId]);

  // Поиск дедлайна цепочки для текущего ребёнка
  useEffect(() => {
    if (!user || role !== 'parent') { setChainDeadline(null); setChainItemId(null); return; }
    (async () => {
      const [allItems, allLists] = await Promise.all([
        taskListsApi.getAllItems(),
        taskListsApi.getAll(),
      ]);
      const myItem = allItems.find(i => i.task_id === taskId && i.user_id === user.PK_UserId && !i.complited);
      if (!myItem) return;
      const list = allLists.find(l => l.PK_id === myItem.task_list_id);
      setChainItemId(myItem.id);
      if (list?.date_complite) setChainDeadline(new Date(list.date_complite));
    })();
  }, [taskId, user, role]);

  const isExpired = chainDeadline ? chainDeadline.getTime() < Date.now() : false;

  // Если просрочено и ребёнок открыл — закрываем доступ и фиксируем как невыполненное
  useEffect(() => {
    if (isExpired && role === 'parent' && user && result === null) {
      setResult('expired');
      // фиксируем «не выполнено»: увеличиваем счётчик пропущенных
      (async () => {
        const all = await childInfoApi.getAll();
        const cur = all.find(i => i.FK_user_id === user.PK_UserId)
          || { FK_user_id: user.PK_UserId, complited_tasks_count: 0, helpe_used_count: 0, miss_tasks_count: 0 };
        await childInfoApi.save(user.PK_UserId, {
          ...cur,
          miss_tasks_count: (cur.miss_tasks_count || 0) + 1,
        });
      })();
    }
  }, [isExpired, role, user, result]);


  // Derive timer + hint settings from constructions
  const timerEnabled = constructions.find(c => c.ParameterName === 'TimerEnabled')?.ParameterValue === 'true';
  const timerSeconds = Number(constructions.find(c => c.ParameterName === 'TimerSeconds')?.ParameterValue) || 60;
  const hintEnabled  = constructions.find(c => c.ParameterName === 'ShowHints')?.ParameterValue === 'true';
  const hintText     = constructions.find(c => c.ParameterName === 'HintText')?.ParameterValue || '';
  const hasHint      = hintEnabled && hintText.trim().length > 0;

  // Start/stop timer when game starts
  useEffect(() => {
    if (started && timerEnabled && result === null) {
      setTimeLeft(timerSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!started) setTimeLeft(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, timerEnabled, timerSeconds, result]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && result === null) {
      setResult('timeout');
    }
  }, [timeLeft, result]);

  const template = task ? templates.find(t => t.PK_TemplateId === task.FK_TemplateId) : null;
  const taskType = task ? templateToType[task.FK_TemplateId] : null;

  const handleComplete = useCallback(async (correct: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResult(correct ? 'correct' : 'wrong');

    if (correct) {
      // мягкое конфетти ~1.5с, пастельные цвета, низкая плотность — для детей с РАС
      const end = Date.now() + 1500;
      const colors = ['#A7E8BD', '#B8D8F8', '#F8D7E6', '#FCE5B6'];
      const tick = () => {
        confetti({ particleCount: 18, angle: 60, spread: 55, startVelocity: 30, gravity: 0.8, ticks: 80, origin: { x: 0, y: 0.8 }, colors, scalar: 0.8 });
        confetti({ particleCount: 18, angle: 120, spread: 55, startVelocity: 30, gravity: 0.8, ticks: 80, origin: { x: 1, y: 0.8 }, colors, scalar: 0.8 });
        if (Date.now() < end) requestAnimationFrame(tick);
      };
      tick();
    }

    if (user) {
      const all = await childInfoApi.getAll();
      const cur = all.find(i => i.FK_user_id === user.PK_UserId) || { FK_user_id: user.PK_UserId, complited_tasks_count: 0, helpe_used_count: 0, miss_tasks_count: 0 };
      await childInfoApi.save(user.PK_UserId, {
        ...cur,
        complited_tasks_count: (cur.complited_tasks_count || 0) + (correct ? 1 : 0),
        miss_tasks_count: (cur.miss_tasks_count || 0) + (correct ? 0 : 1),
        helpe_used_count: (cur.helpe_used_count || 0) + (hintShown ? 1 : 0),
      });
    }

    if (correct && user) {
      const updated = await taskListsApi.markTaskCompletedForUser(taskId, user.PK_UserId);
      if (updated.length > 0) {
        const statuses = await taskListsApi.getStatusesForUser(user.PK_UserId);
        const finished = updated.map(u => u.task_list_id).filter((v, i, a) => a.indexOf(v) === i).filter(id => statuses[id]?.isDone);
        if (finished.length > 0) {
          const awarded = await taskListsApi.awardForCompletedChains(user.PK_UserId);
          setAwardedAchievements(awarded);
          toast.success(awarded.length > 0 ? `🏆 Получено достижение: ${awarded.map(a => a.name).join(', ')}` : '🎉 Цепочка заданий завершена!');
        } else {
          toast.success('Шаг цепочки выполнен ✅');
        }
      }
      const nxt = await taskListsApi.getNextInChainsForUser(taskId, user.PK_UserId);
      setNextInChain(nxt);
    }
  }, [taskId, user, hintShown]);

  const handleRestart = () => {
    setResult(null);
    setStarted(false);
    setHintShown(false);
    setNextInChain(null);
    setTimeout(() => setStarted(true), 50);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3 animate-bounce">⏳</p>
        <p className="text-muted-foreground font-bold">Загрузка...</p>
      </div>
    );
  }

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

  const diff = task.DifficultyLevel ? difficultyLabels[task.DifficultyLevel] : null;

  // Result screen
  if (result) {
    const goHome = () => {
      const homePath = user?.FK_RoleId === 1 ? '/home' : '/dashboard';
      navigate(homePath);
    };
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-card rounded-2xl border-2 border-border p-10 animate-fade-in">
          <p className="text-6xl mb-4">{result === 'correct' ? '🎉' : result === 'timeout' ? '⏰' : result === 'expired' ? '🔒' : '😔'}</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {result === 'correct' ? 'Готово!'
              : result === 'timeout' ? 'Время вышло!'
              : result === 'expired' ? 'Срок задания истёк'
              : 'Попробуй ещё раз!'}
          </h2>
          <p className="text-muted-foreground mb-6 font-medium">
            {result === 'correct' ? 'Ты справился с заданием!'
              : result === 'timeout' ? 'К сожалению, время закончилось.'
              : result === 'expired' ? 'Это задание больше недоступно. Оно засчитано как невыполненное.'
              : 'Не расстраивайся, попробуй снова!'}
          </p>

          {result === 'correct' && awardedAchievements.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-warning/10 border-2 border-warning">
              <p className="text-3xl mb-1">🏆</p>
              <p className="font-bold text-warning">Новое достижение!</p>
              <p className="text-sm text-foreground font-semibold mt-1">{awardedAchievements.map(a => a.name).join(', ')}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={goHome} className="rounded-xl font-bold gap-2 h-12">
              <Home className="h-4 w-4" /> На главную
            </Button>
            {result !== 'correct' && result !== 'expired' && (
              <Button variant="outline" onClick={handleRestart} className="rounded-xl font-bold gap-2 h-12">
                <RotateCcw className="h-4 w-4" /> Ещё раз
              </Button>
            )}
            {result === 'correct' && nextInChain && (
              <Button
                onClick={() => {
                  setHintShown(false);
                  setNextInChain(null);
                  setAwardedAchievements([]);
                  setResult(null);
                  setStarted(false);
                  navigate(`/task/${nextInChain.nextTaskId}`);
                }}
                className="rounded-xl font-bold gap-2 h-12"
              >
                Следующее задание <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  if (started) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => { setStarted(false); setHintShown(false); }} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к описанию
        </button>

        {/* Подсказка над заданием */}
        {hasHint && hintShown && (
          <div className="mb-4 p-4 rounded-2xl border-2 border-warning bg-warning/10 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-warning uppercase tracking-wider mb-1">Подсказка</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">{hintText}</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl border-2 border-border p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{task.Title}</h2>
            <div className="flex items-center justify-center gap-4 mt-1">
              {diff && <p className="text-sm text-muted-foreground font-medium">{diff.emoji} {diff.label}</p>}
              {timerEnabled && timeLeft !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${timeLeft <= 10 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
                  <Timer className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Заметная кнопка-лампочка */}
            {hasHint && (
              <Button
                type="button"
                variant={hintShown ? 'outline' : 'default'}
                onClick={() => setHintShown(s => !s)}
                className="mt-4 gap-2 rounded-2xl font-bold bg-warning hover:bg-warning/90 text-warning-foreground border-2 border-warning"
              >
                <Lightbulb className="h-5 w-5" />
                {hintShown ? 'Скрыть подсказку' : 'Подсказка'}
              </Button>
            )}
          </div>

          {taskType === 'find_odd' && findOddItems.length > 0 && (
            <FindOddGame items={findOddItems} pecsList={pecsList} onComplete={handleComplete} />
          )}
          {taskType === 'match_image_word' && matchPairs.length > 0 && (
            <MatchGame pairs={matchPairs} pecsList={pecsList} onComplete={handleComplete} />
          )}
          {taskType === 'sequence' && seqItems.length > 0 && (
            <SequenceGame items={seqItems} pecsList={pecsList} onComplete={handleComplete} />
          )}
          {taskType === 'sort' && sortItems.length > 0 && (
            <SortGame items={sortItems} pecsList={pecsList} onComplete={handleComplete} />
          )}

          {/* Fallback if no items loaded */}
          {((taskType === 'find_odd' && findOddItems.length === 0) ||
            (taskType === 'match_image_word' && matchPairs.length === 0) ||
            (taskType === 'sequence' && seqItems.length === 0) ||
            (taskType === 'sort' && sortItems.length === 0)) && (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-muted-foreground font-bold">Нет данных для этого задания</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Description screen (no difficulty selector - it's set at creation)
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Каталог заданий
        </button>
        {canEditTask && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold gap-2"
              onClick={() => navigate(`/editor/${taskId}`)}
            >
              <Pencil className="h-4 w-4" /> Редактировать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl font-bold gap-2"
              onClick={async () => {
                if (!confirm('Удалить задание?')) return;
                const ok = await api.deleteTask(taskId);
                if (ok) { toast.success('Задание удалено'); navigate('/dashboard'); }
                else toast.error('Ошибка при удалении');
              }}
            >
              <Trash2 className="h-4 w-4" /> Удалить
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border-2 border-border p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{task.Title}</h1>
        {template && (
          <p className="text-sm font-bold text-primary mb-2">📋 {template.TemplateName}</p>
        )}
         {diff && (
          <p className="text-sm text-muted-foreground font-medium mb-2">
            {diff.emoji} Уровень: {diff.label}
          </p>
        )}
        {timerEnabled && (
          <p className="text-sm text-muted-foreground font-medium mb-4 flex items-center gap-1.5">
            <Timer className="h-4 w-4" /> Время на выполнение: {formatTime(timerSeconds)}
          </p>
        )}
        {chainDeadline && (
          <p className={`text-sm font-bold mb-4 flex items-center gap-1.5 ${isExpired ? 'text-destructive' : 'text-warning'}`}>
            <Timer className="h-4 w-4" />
            {isExpired ? 'Срок выполнения истёк' : `Выполнить до: ${chainDeadline.toLocaleString('ru')}`}
          </p>
        )}
        {hasHint && (
          <p className="text-sm text-warning font-bold mb-4 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" /> В задании есть подсказка — нажми на лампочку, если потребуется помощь
          </p>
        )}
        <p className="text-muted-foreground leading-relaxed mb-8 font-medium">{task.Descripti}</p>

        <Button
          onClick={() => setStarted(true)}
          disabled={isExpired && role === 'parent'}
          className="gap-2 h-14 text-lg font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          size="lg"
        >
          <Play className="h-6 w-6" />
          {isExpired && role === 'parent' ? 'Задание недоступно' : 'Начать задание'}
        </Button>
      </div>

    </div>
  );
};

export default TaskDetailPage;
