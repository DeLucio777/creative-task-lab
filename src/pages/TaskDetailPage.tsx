import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/services/api';
import type { Task, TaskTemplate, FindOddOneOutItem, MatchImageWordPair, SequenceItem, SortItem, CatalogPECS } from '@/types/models';
import { Progress } from '@/components/ui/progress';

const difficultyLabels: Record<string, { label: string; emoji: string }> = {
  Easy: { label: 'Лёгкий', emoji: '🟢' },
  Medium: { label: 'Средний', emoji: '🟡' },
  Hard: { label: 'Сложный', emoji: '🔴' },
};

// Template ID → task type mapping
const templateToType: Record<number, string> = {
  3: 'find_odd',
  4: 'match_image_word',
  1: 'sequence',
  2: 'sort',
};

// --- Interactive game components ---

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
              className={`p-5 rounded-2xl border-3 text-center transition-all duration-300 active:scale-[0.95] ${
                isCorrect ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200/50' :
                isWrong ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50' :
                isSelected ? 'border-primary bg-primary/5 shadow-md' :
                'border-border bg-card hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              {pecs && (
                <img src={pecs.filePath} alt={pecs.Descripti} className="w-16 h-16 object-contain mx-auto mb-2 rounded-xl" />
              )}
              <p className="text-base font-bold">{item.ItemText}</p>
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
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const handleWordClick = (pairId: number) => {
    if (checked || selectedImage === null) return;
    setMatches(prev => ({ ...prev, [selectedImage]: pairId }));
    setSelectedImage(null);
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = pairs.every(p => matches[p.PK_PairId] === p.PK_PairId);
    setTimeout(() => onComplete(allCorrect), 2000);
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

            return (
              <button
                key={pair.PK_PairId}
                onClick={() => !checked && setSelectedImage(pair.PK_PairId)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isCorrect ? 'border-green-400 bg-green-50' :
                  isWrong ? 'border-red-400 bg-red-50' :
                  isSelected ? 'border-primary bg-primary/5 shadow-md' :
                  isMatched ? 'border-accent bg-accent/50' :
                  'border-border bg-card hover:border-primary/30'
                }`}
              >
                {pecs && <img src={pecs.filePath} alt="" className="w-12 h-12 object-contain mx-auto rounded-xl" />}
                {!pecs && <div className="w-12 h-12 bg-muted rounded-xl mx-auto flex items-center justify-center text-2xl">🖼️</div>}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Слова</p>
          {shuffledWords.map(pair => {
            const isUsed = Object.values(matches).includes(pair.PK_PairId);
            return (
              <button
                key={pair.PK_PairId}
                onClick={() => handleWordClick(pair.PK_PairId)}
                disabled={isUsed || checked}
                className={`w-full p-4 rounded-2xl border-2 text-base font-bold transition-all duration-200 ${
                  isUsed ? 'border-accent bg-accent/30 text-accent-foreground' :
                  'border-border bg-card hover:border-primary/30 text-foreground'
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
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold transition-all ${
                  isCorrect ? 'border-green-400 bg-green-50 text-green-700' :
                  isWrong ? 'border-red-400 bg-red-50 text-red-700' :
                  'border-primary bg-primary/5 text-foreground hover:bg-primary/10'
                }`}
              >
                <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                {pecs && <img src={pecs.filePath} alt="" className="w-6 h-6 object-contain rounded" />}
                {item.ItemValue}
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
                className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-card font-bold hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.95]"
              >
                {pecs && <img src={pecs.filePath} alt="" className="w-6 h-6 object-contain rounded" />}
                {item.ItemValue}
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
            className={`rounded-2xl border-2 p-4 transition-all min-h-[120px] ${
              selectedCategory === cat ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <p className="text-sm font-bold text-primary mb-3">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {buckets[cat].map(item => {
                const isCorrect = checked && item.SortKey === cat;
                const isWrong = checked && item.SortKey !== cat;
                const pecs = item.FK_pecsId ? pecsList.find(p => p.PK_PECSid === item.FK_pecsId) : null;
                return (
                  <button
                    key={item.PK_SortItemId}
                    onClick={(e) => { e.stopPropagation(); removeFromBucket(cat, item); }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isCorrect ? 'bg-green-100 text-green-700 border border-green-300' :
                      isWrong ? 'bg-red-100 text-red-700 border border-red-300' :
                      'bg-muted text-foreground border border-border'
                    }`}
                  >
                    {pecs && <img src={pecs.filePath} alt="" className="w-4 h-4 object-contain rounded" />}
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
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-card font-bold hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.95] disabled:opacity-50"
                >
                  {pecs && <img src={pecs.filePath} alt="" className="w-6 h-6 object-contain rounded" />}
                  {item.ItemValue}
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
  const taskId = Number(id);

  const [task, setTask] = useState<Task | null>(null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [pecsList, setPecsList] = useState<CatalogPECS[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

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
    ]).then(([t, tmpl, pecs, odd, match, seq, sort]) => {
      setTask(t);
      setTemplates(tmpl);
      setPecsList(pecs);
      setFindOddItems(odd);
      setMatchPairs(match);
      setSeqItems(seq);
      setSortItems(sort);
      setLoading(false);
    });
  }, [taskId]);

  const template = task ? templates.find(t => t.PK_TemplateId === task.FK_TemplateId) : null;
  const taskType = task ? templateToType[task.FK_TemplateId] : null;

  const handleComplete = useCallback((correct: boolean) => {
    setResult(correct ? 'correct' : 'wrong');
  }, []);

  const handleRestart = () => {
    setResult(null);
    setStarted(false);
    // Re-trigger to reset game state
    setTimeout(() => setStarted(true), 50);
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
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <button onClick={() => { setStarted(false); setResult(null); }} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <div className="bg-card rounded-2xl border-2 border-border p-10">
          <p className="text-6xl mb-4">{result === 'correct' ? '🎉' : '😔'}</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {result === 'correct' ? 'Молодец!' : 'Попробуй ещё раз!'}
          </h2>
          <p className="text-muted-foreground mb-6 font-medium">
            {result === 'correct' ? 'Ты справился с заданием!' : 'Не расстраивайся, попробуй снова!'}
          </p>
          <Progress value={result === 'correct' ? 100 : 30} className="h-3 mb-6" />
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStarted(false); setResult(null); }} className="rounded-xl font-bold gap-2">
              <ArrowLeft className="h-4 w-4" /> К описанию
            </Button>
            <Button onClick={handleRestart} className="rounded-xl font-bold gap-2">
              <RotateCcw className="h-4 w-4" /> Ещё раз
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  if (started) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Назад к описанию
        </button>
        <div className="bg-card rounded-2xl border-2 border-border p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">{task.Title}</h2>
            {diff && <p className="text-sm text-muted-foreground font-medium mt-1">{diff.emoji} {diff.label}</p>}
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
          {taskType === 'find_odd' && findOddItems.length === 0 &&
            taskType === 'match_image_word' && matchPairs.length === 0 &&
            taskType === 'sequence' && seqItems.length === 0 &&
            taskType === 'sort' && sortItems.length === 0 && (
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
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Каталог заданий
      </button>

      <div className="bg-card rounded-2xl border-2 border-border p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{task.Title}</h1>
        {template && (
          <p className="text-sm font-bold text-primary mb-2">📋 {template.TemplateName}</p>
        )}
        {diff && (
          <p className="text-sm text-muted-foreground font-medium mb-4">
            {diff.emoji} Уровень: {diff.label}
          </p>
        )}
        <p className="text-muted-foreground leading-relaxed mb-8 font-medium">{task.Descripti}</p>

        <Button
          onClick={() => setStarted(true)}
          className="gap-2 h-14 text-lg font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]"
          size="lg"
        >
          <Play className="h-6 w-6" />
          Начать задание
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailPage;
