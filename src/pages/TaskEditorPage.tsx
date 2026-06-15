import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Save, Plus, Trash2, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CatalogPECS, MediaCatalog } from '@/types/models';
import TaskPreview from '@/components/TaskPreview';

type TaskType = 'find_odd' | 'match_image_word' | 'sequence' | 'sort';

interface FindOddItem { id: string; text: string; isOdd: boolean; pecsId?: number; }
interface MatchPair { id: string; mediaId?: number; pecsId?: number; word: string; }
interface SeqItem { id: string; order: number; value: string; pecsId?: number; }
interface SortItemData { id: string; value: string; sortKey: string; pecsId?: number; }

const TASK_TYPE_OPTIONS: { value: TaskType; label: string; emoji: string; templateId: number }[] = [
  { value: 'find_odd',         label: 'Найди лишнее',                   emoji: '🔍', templateId: 1 },
  { value: 'match_image_word', label: 'Сопоставь картинку и слово',     emoji: '🖼️', templateId: 2 },
  { value: 'sequence',         label: 'Продолжи последовательность',     emoji: '🔢', templateId: 3 },
  { value: 'sort',             label: 'Сортировка по признаку',          emoji: '📂', templateId: 4 },
];

const templateToType: Record<number, TaskType> = {
  1: 'find_odd',
  2: 'match_image_word',
  3: 'sequence',
  4: 'sort',
};

// --- PECS Preview subcomponent ---
const PecsPreview: React.FC<{
  pecsId?: number;
  pecsList: CatalogPECS[];
  onSelect: (id: number) => void;
  onClear: () => void;
}> = ({ pecsId, pecsList, onSelect, onClear }) => {
  const selected = pecsId ? pecsList.find(p => p.PK_PECSid === pecsId) : null;

  if (selected) {
    return (
      <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-xl border-2 border-primary/20">
        <div className="w-12 h-12 bg-card rounded-lg border border-border flex items-center justify-center shrink-0">
          <img src={selected.filePath} alt={selected.Descripti} className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{selected.Descripti}</p>
          <p className="text-xs text-muted-foreground">{selected.Category}</p>
        </div>
        <button onClick={onClear} className="text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <select
      className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium"
      onChange={e => onSelect(Number(e.target.value))}
      defaultValue=""
    >
      <option value="" disabled>Выберите PECS...</option>
      {pecsList.map(p => (
        <option key={p.PK_PECSid} value={p.PK_PECSid}>
          {p.Descripti} ({p.Category})
        </option>
      ))}
    </select>
  );
};

// --- Main editor ---
const TaskEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [pecsList, setPecsList] = useState<CatalogPECS[]>([]);
  const [mediaList, setMediaList] = useState<MediaCatalog[]>([]);

  useEffect(() => {
    api.getPecs().then(setPecsList);
    api.getMedia().then(setMediaList);
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('find_odd');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [showHints, setShowHints] = useState(true);
  const [hintText, setHintText] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(!isNew);
  const [originalAuthorId, setOriginalAuthorId] = useState<number | null>(null);
  const [originalIsPublished, setOriginalIsPublished] = useState<boolean | undefined>(undefined);

  const [oddItems, setOddItems] = useState<FindOddItem[]>([
    { id: '1', text: '', isOdd: false },
    { id: '2', text: '', isOdd: false },
    { id: '3', text: '', isOdd: true },
  ]);
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([
    { id: '1', word: '' },
    { id: '2', word: '' },
  ]);
  const [seqItems, setSeqItems] = useState<SeqItem[]>([
    { id: '1', order: 1, value: '' },
    { id: '2', order: 2, value: '' },
    { id: '3', order: 3, value: '' },
  ]);
  const [sortItems, setSortItems] = useState<SortItemData[]>([
    { id: '1', value: '', sortKey: '' },
    { id: '2', value: '', sortKey: '' },
  ]);

  // Загрузка существующего задания (для админа при редактировании)
  useEffect(() => {
    if (isNew || !id) return;
    const taskId = Number(id);
    if (isNaN(taskId)) return;
    Promise.all([
      api.getTask(taskId),
      api.getTaskConstructions(taskId),
      api.getTaskFindOddItems(taskId),
      api.getTaskMatchPairs(taskId),
      api.getTaskSequenceItems(taskId),
      api.getTaskSortItems(taskId),
    ]).then(([t, constr, odd, match, seq, sort]) => {
      if (!t) { setLoadingExisting(false); return; }
      setTitle(t.Title || '');
      setDescription(t.Descripti || '');
      setDifficulty((t.DifficultyLevel as 'Easy' | 'Medium' | 'Hard') || 'Easy');
      setOriginalAuthorId(t.FK_UserId);
      setOriginalIsPublished(t.public_task);
      const detected = templateToType[t.FK_TemplateId] || 'find_odd';
      setTaskType(detected);

      const cShow = constr.find(c => c.ParameterName === 'ShowHints')?.ParameterValue;
      const cHint = constr.find(c => c.ParameterName === 'HintText')?.ParameterValue;
      const cTOn  = constr.find(c => c.ParameterName === 'TimerEnabled')?.ParameterValue;
      const cTSec = constr.find(c => c.ParameterName === 'TimerSeconds')?.ParameterValue;
      setShowHints(cShow !== 'false');
      setHintText(cHint || '');
      setTimerEnabled(cTOn === 'true');
      if (cTSec) setTimerSeconds(Number(cTSec) || 60);

      if (odd.length > 0)   setOddItems(odd.map(i => ({ id: String(i.PK_ItemId), text: i.ItemText, isOdd: i.IsOddOne, pecsId: i.FK_pecsId })));
      if (match.length > 0) setMatchPairs(match.map(p => ({ id: String(p.PK_PairId), mediaId: p.FK_MediaId, pecsId: p.FK_pecsId, word: p.Words })));
      if (seq.length > 0)   setSeqItems(seq.map(i => ({ id: String(i.PK_SeqItemId), order: i.ItemOrder, value: i.ItemValue, pecsId: i.FK_pecsId })));
      if (sort.length > 0)  setSortItems(sort.map(i => ({ id: String(i.PK_SortItemId), value: i.ItemValue, sortKey: i.SortKey, pecsId: i.FK_pecsId })));
      setLoadingExisting(false);
    });
  }, [id, isNew]);

  const difficultyLabels: Record<string, { label: string; emoji: string }> = {
    Easy: { label: 'Лёгкий', emoji: '🟢' },
    Medium: { label: 'Средний', emoji: '🟡' },
    Hard: { label: 'Сложный', emoji: '🔴' },
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Validation ---
  const validate = (): string | null => {
    if (!title.trim()) return 'Введите название задания';
    if (!description.trim()) return 'Введите описание задания';

    if (taskType === 'find_odd') {
      const filled = oddItems.filter(i => i.text.trim());
      if (filled.length < 3) return 'Для задания "Найди лишнее" нужно минимум 3 элемента с заполненным текстом';
      const hasEmpty = oddItems.some(i => !i.text.trim());
      if (hasEmpty) return 'Все элементы должны иметь заполненное название (NOT NULL)';
      const hasOdd = oddItems.some(i => i.isOdd);
      if (!hasOdd) return 'Отметьте хотя бы один элемент как "лишний"';
    } else if (taskType === 'match_image_word') {
      if (matchPairs.length < 2) return 'Для задания "Сопоставь" нужно минимум 2 пары';
      const hasEmpty = matchPairs.some(p => !p.word.trim());
      if (hasEmpty) return 'Все пары должны иметь заполненное слово (NOT NULL)';
    } else if (taskType === 'sequence') {
      if (seqItems.length < 2) return 'Для последовательности нужно минимум 2 элемента';
      const hasEmpty = seqItems.some(i => !i.value.trim());
      if (hasEmpty) return 'Все элементы последовательности должны иметь значение (NOT NULL)';
    } else if (taskType === 'sort') {
      if (sortItems.length < 2) return 'Для сортировки нужно минимум 2 элемента';
      const hasEmptyValue = sortItems.some(i => !i.value.trim());
      if (hasEmptyValue) return 'Все элементы сортировки должны иметь значение (NOT NULL)';
      const hasEmptyKey = sortItems.some(i => !i.sortKey.trim());
      if (hasEmptyKey) return 'Все элементы сортировки должны иметь ключ/категорию (NOT NULL)';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const templateId = TASK_TYPE_OPTIONS.find(o => o.value === taskType)?.templateId || 1;

      const constructions = [
        { ParameterName: 'DifficultyLevel', ParameterValue: difficulty },
        { ParameterName: 'ShowHints', ParameterValue: String(showHints) },
        { ParameterName: 'HintText', ParameterValue: showHints ? hintText.trim() : '' },
        { ParameterName: 'TimerEnabled', ParameterValue: String(timerEnabled) },
        { ParameterName: 'TimerSeconds', ParameterValue: String(timerSeconds) },
      ];

      const payload: Parameters<typeof api.createFullTask>[0] = {
        task: {
          Title: title,
          Descripti: description,
          FK_TemplateId: templateId,
          FK_UserId: originalAuthorId ?? 1,
          DifficultyLevel: difficulty,
          ...(originalIsPublished !== undefined ? { public_task: originalIsPublished } : {}),
        },
        constructions,
      };

      if (taskType === 'find_odd') {
        payload.findOddItems = oddItems.map(i => ({ ItemText: i.text, IsOddOne: i.isOdd, FK_pecsId: i.pecsId }));
      } else if (taskType === 'match_image_word') {
        payload.matchPairs = matchPairs.map(p => ({ FK_MediaId: p.mediaId, FK_pecsId: p.pecsId, Words: p.word }));
      } else if (taskType === 'sequence') {
        payload.sequenceItems = seqItems.map((i, idx) => ({ ItemOrder: idx + 1, ItemValue: i.value, FK_pecsId: i.pecsId }));
      } else if (taskType === 'sort') {
        payload.sortItems = sortItems.map(i => ({ ItemValue: i.value, SortKey: i.sortKey, FK_pecsId: i.pecsId }));
      }

      const result = isNew
        ? await api.createFullTask(payload)
        : await api.updateFullTask(Number(id), payload);
      if (result) {
        toast.success(isNew ? 'Задание создано!' : 'Задание обновлено!');
        navigate('/dashboard');
      } else {
        toast.error('Ошибка при сохранении');
      }
    } catch {
      toast.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  // --- Render functions for each task type ---
  const renderFindOdd = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-foreground">Элементы задания</h4>
        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-1" onClick={() =>
          setOddItems(prev => [...prev, { id: String(Date.now()), text: '', isOdd: false }])
        }>
          <Plus className="h-3 w-3" /> Добавить
        </Button>
      </div>
      {oddItems.map((item, idx) => (
        <div key={item.id} className="flex gap-3 items-start p-3 bg-muted/50 rounded-xl border border-border">
          <span className="text-lg font-bold text-muted-foreground mt-1">{idx + 1}</span>
          <div className="flex-1 space-y-2">
            <Input value={item.text} onChange={e => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} placeholder="Текст элемента *" className={`rounded-xl h-11 ${!item.text.trim() ? 'border-destructive' : ''}`} />
            <PecsPreview pecsList={pecsList} pecsId={item.pecsId} onSelect={pecsId => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))} onClear={() => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))} />
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
            <label className="text-xs font-semibold text-muted-foreground">Лишний?</label>
            <Switch checked={item.isOdd} onCheckedChange={v => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, isOdd: v } : i))} />
          </div>
          {oddItems.length > 3 && (
            <button onClick={() => setOddItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderMatchImageWord = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-foreground">Пары (картинка — слово)</h4>
        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-1" onClick={() =>
          setMatchPairs(prev => [...prev, { id: String(Date.now()), word: '' }])
        }>
          <Plus className="h-3 w-3" /> Добавить
        </Button>
      </div>
      {matchPairs.map((pair, idx) => (
        <div key={pair.id} className="p-3 bg-muted/50 rounded-xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">Пара {idx + 1}</span>
            {matchPairs.length > 2 && (
              <button onClick={() => setMatchPairs(prev => prev.filter(p => p.id !== pair.id))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <PecsPreview pecsList={pecsList} pecsId={pair.pecsId} onSelect={pecsId => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, pecsId } : p))} onClear={() => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, pecsId: undefined } : p))} />
          <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={pair.mediaId ?? ''} onChange={e => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, mediaId: Number(e.target.value) } : p))}>
            <option value="" disabled>Выберите медиа...</option>
            {mediaList.map(m => <option key={m.PK_MediaId} value={m.PK_MediaId}>{m.Descripti}</option>)}
          </select>
          <Input value={pair.word} onChange={e => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, word: e.target.value } : p))} placeholder="Слово для соотнесения *" className={`rounded-xl h-11 ${!pair.word.trim() ? 'border-destructive' : ''}`} />
        </div>
      ))}
    </div>
  );

  const renderSequence = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-foreground">Элементы последовательности</h4>
        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-1" onClick={() =>
          setSeqItems(prev => [...prev, { id: String(Date.now()), order: prev.length + 1, value: '' }])
        }>
          <Plus className="h-3 w-3" /> Добавить
        </Button>
      </div>
      {seqItems.map((item, idx) => (
        <div key={item.id} className="flex gap-3 items-start p-3 bg-muted/50 rounded-xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{idx + 1}</span>
          </div>
          <div className="flex-1 space-y-2">
            <Input value={item.value} onChange={e => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, value: e.target.value } : i))} placeholder="Значение элемента *" className={`rounded-xl h-11 ${!item.value.trim() ? 'border-destructive' : ''}`} />
            <PecsPreview pecsList={pecsList} pecsId={item.pecsId} onSelect={pecsId => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))} onClear={() => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))} />
          </div>
          {seqItems.length > 2 && (
            <button onClick={() => setSeqItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderSort = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-foreground">Элементы сортировки</h4>
        <Button variant="outline" size="sm" className="rounded-xl font-bold gap-1" onClick={() =>
          setSortItems(prev => [...prev, { id: String(Date.now()), value: '', sortKey: '' }])
        }>
          <Plus className="h-3 w-3" /> Добавить
        </Button>
      </div>
      {sortItems.map((item, idx) => (
        <div key={item.id} className="flex gap-3 items-start p-3 bg-muted/50 rounded-xl border border-border">
          <span className="text-lg font-bold text-muted-foreground mt-1">{idx + 1}</span>
          <div className="flex-1 space-y-2">
            <Input value={item.value} onChange={e => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, value: e.target.value } : i))} placeholder="Значение элемента *" className={`rounded-xl h-11 ${!item.value.trim() ? 'border-destructive' : ''}`} />
            <Input value={item.sortKey} onChange={e => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, sortKey: e.target.value } : i))} placeholder="Ключ сортировки (категория) *" className={`rounded-xl h-11 ${!item.sortKey.trim() ? 'border-destructive' : ''}`} />
            <PecsPreview pecsList={pecsList} pecsId={item.pecsId} onSelect={pecsId => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))} onClear={() => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))} />
          </div>
          {sortItems.length > 2 && (
            <button onClick={() => setSortItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderTaskTypeContent = () => {
    switch (taskType) {
      case 'find_odd': return renderFindOdd();
      case 'match_image_word': return renderMatchImageWord();
      case 'sequence': return renderSequence();
      case 'sort': return renderSort();
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Editor */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {isNew ? '✨ Новое задание' : '✏️ Редактирование задания'}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Название <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Введите название задания" className={`rounded-xl h-11 ${!title.trim() && title !== '' ? 'border-destructive' : ''}`} />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Описание <span className="text-destructive">*</span></Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание задания..." className="w-full min-h-[100px] rounded-xl border-2 border-input bg-background px-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Тип задания</h3>
            <div className="grid grid-cols-2 gap-3">
              {TASK_TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setTaskType(opt.value)} className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${taskType === opt.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}>
                  <span className="text-2xl mb-1 block">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${taskType === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">
              {TASK_TYPE_OPTIONS.find(o => o.value === taskType)?.emoji} Содержание задания
            </h3>
            {renderTaskTypeContent()}
          </div>
        </div>

        {/* Right: Settings + Preview */}
        <div className="w-full lg:w-[320px] lg:shrink-0 space-y-6">
          <div className="bg-card rounded-2xl border-2 border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">⚙️ Настройки</h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Сложность</p>
                <div className="space-y-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                    <button key={level} onClick={() => setDifficulty(level)} className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${difficulty === level ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
                      {difficultyLabels[level].emoji} {difficultyLabels[level].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">💡 Подсказка</Label>
                  <Switch checked={showHints} onCheckedChange={setShowHints} />
                </div>
                {showHints && (
                  <textarea
                    value={hintText}
                    onChange={e => setHintText(e.target.value)}
                    placeholder="Текст подсказки, который увидит ребёнок..."
                    className="w-full min-h-[80px] rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                )}
              </div>

              {/* Timer setting */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-bold">Таймер</Label>
                  </div>
                  <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                </div>
                {timerEnabled && (
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Время на задание</span>
                      <span className="text-sm font-bold text-primary">{formatTime(timerSeconds)}</span>
                    </div>
                    <Slider
                      value={[timerSeconds]}
                      onValueChange={([v]) => setTimerSeconds(v)}
                      min={10}
                      max={300}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0:10</span>
                      <span>5:00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <TaskPreview
            taskType={taskType}
            title={title}
            difficulty={difficulty}
            showHints={showHints}
            oddItems={oddItems}
            matchPairs={matchPairs}
            seqItems={seqItems}
            sortItems={sortItems}
          />

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 gap-2 text-base font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">
            <Save className="h-5 w-5" /> {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorPage;
