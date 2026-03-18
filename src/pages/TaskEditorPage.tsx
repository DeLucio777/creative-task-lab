import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { MOCK_PECS, MOCK_TEMPLATES, MOCK_MEDIA } from '@/data/mockData';

type TaskType = 'find_odd' | 'match_image_word' | 'sequence' | 'sort';

interface FindOddItem { id: string; text: string; isOdd: boolean; pecsId?: number; }
interface MatchPair { id: string; mediaId?: number; pecsId?: number; word: string; }
interface SeqItem { id: string; order: number; value: string; pecsId?: number; }
interface SortItem { id: string; value: string; sortKey: string; pecsId?: number; }

const TASK_TYPE_OPTIONS: { value: TaskType; label: string; emoji: string; templateId: number }[] = [
  { value: 'find_odd', label: 'Найди лишнее', emoji: '🔍', templateId: 3 },
  { value: 'match_image_word', label: 'Сопоставь картинку и слово', emoji: '🖼️', templateId: 4 },
  { value: 'sequence', label: 'Продолжи последовательность', emoji: '🔢', templateId: 1 },
  { value: 'sort', label: 'Сортировка по признаку', emoji: '📂', templateId: 2 },
];

const PecsPreview: React.FC<{ pecsId?: number; onSelect: (id: number) => void; onClear: () => void }> = ({ pecsId, onSelect, onClear }) => {
  const selected = pecsId ? MOCK_PECS.find(p => p.PK_PECSid === pecsId) : null;

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
      {MOCK_PECS.map(p => (
        <option key={p.PK_PECSid} value={p.PK_PECSid}>
          {p.Descripti} ({p.Category})
        </option>
      ))}
    </select>
  );
};

const TaskEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('find_odd');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [showHints, setShowHints] = useState(true);
  const [elementCount, setElementCount] = useState([6]);

  // Find odd one out
  const [oddItems, setOddItems] = useState<FindOddItem[]>([
    { id: '1', text: '', isOdd: false },
    { id: '2', text: '', isOdd: false },
    { id: '3', text: '', isOdd: true },
  ]);

  // Match image-word
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([
    { id: '1', word: '' },
    { id: '2', word: '' },
  ]);

  // Sequence
  const [seqItems, setSeqItems] = useState<SeqItem[]>([
    { id: '1', order: 1, value: '' },
    { id: '2', order: 2, value: '' },
    { id: '3', order: 3, value: '' },
  ]);

  // Sort
  const [sortItems, setSortItems] = useState<SortItem[]>([
    { id: '1', value: '', sortKey: '' },
    { id: '2', value: '', sortKey: '' },
  ]);

  const difficultyLabels: Record<string, { label: string; emoji: string }> = {
    Easy: { label: 'Лёгкий', emoji: '🟢' },
    Medium: { label: 'Средний', emoji: '🟡' },
    Hard: { label: 'Сложный', emoji: '🔴' },
  };

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
            <Input
              value={item.text}
              onChange={e => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
              placeholder="Текст элемента"
              className="rounded-xl h-11"
            />
            <PecsPreview
              pecsId={item.pecsId}
              onSelect={pecsId => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))}
              onClear={() => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))}
            />
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
            <label className="text-xs font-semibold text-muted-foreground">Лишний?</label>
            <Switch
              checked={item.isOdd}
              onCheckedChange={v => setOddItems(prev => prev.map(i => i.id === item.id ? { ...i, isOdd: v } : i))}
            />
          </div>
          <button onClick={() => setOddItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
            <Trash2 className="h-4 w-4" />
          </button>
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
            <button onClick={() => setMatchPairs(prev => prev.filter(p => p.id !== pair.id))} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <PecsPreview
            pecsId={pair.pecsId}
            onSelect={pecsId => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, pecsId } : p))}
            onClear={() => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, pecsId: undefined } : p))}
          />
          <select
            className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium"
            value={pair.mediaId ?? ''}
            onChange={e => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, mediaId: Number(e.target.value) } : p))}
          >
            <option value="" disabled>Выберите медиа...</option>
            {MOCK_MEDIA.map(m => (
              <option key={m.PK_MediaId} value={m.PK_MediaId}>{m.Descripti}</option>
            ))}
          </select>
          <Input
            value={pair.word}
            onChange={e => setMatchPairs(prev => prev.map(p => p.id === pair.id ? { ...p, word: e.target.value } : p))}
            placeholder="Слово для соотнесения"
            className="rounded-xl h-11"
          />
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
            <Input
              value={item.value}
              onChange={e => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, value: e.target.value } : i))}
              placeholder="Значение элемента"
              className="rounded-xl h-11"
            />
            <PecsPreview
              pecsId={item.pecsId}
              onSelect={pecsId => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))}
              onClear={() => setSeqItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))}
            />
          </div>
          <button onClick={() => setSeqItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
            <Trash2 className="h-4 w-4" />
          </button>
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
            <Input
              value={item.value}
              onChange={e => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, value: e.target.value } : i))}
              placeholder="Значение элемента"
              className="rounded-xl h-11"
            />
            <Input
              value={item.sortKey}
              onChange={e => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, sortKey: e.target.value } : i))}
              placeholder="Ключ сортировки (категория)"
              className="rounded-xl h-11"
            />
            <PecsPreview
              pecsId={item.pecsId}
              onSelect={pecsId => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId } : i))}
              onClear={() => setSortItems(prev => prev.map(i => i.id === item.id ? { ...i, pecsId: undefined } : i))}
            />
          </div>
          <button onClick={() => setSortItems(prev => prev.filter(i => i.id !== item.id))} className="text-muted-foreground hover:text-destructive mt-2">
            <Trash2 className="h-4 w-4" />
          </button>
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
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад
      </button>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Title & description */}
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {isNew ? '✨ Новое задание' : '✏️ Редактирование задания'}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Название</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Введите название задания" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Описание</Label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Описание задания..."
                  className="w-full min-h-[100px] rounded-xl border-2 border-input bg-background px-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Task type selector */}
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Тип задания</h3>
            <div className="grid grid-cols-2 gap-3">
              {TASK_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTaskType(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    taskType === opt.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${taskType === opt.value ? 'text-primary' : 'text-foreground'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Task type specific content */}
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">
              {TASK_TYPE_OPTIONS.find(o => o.value === taskType)?.emoji} Содержание задания
            </h3>
            {renderTaskTypeContent()}
          </div>
        </div>

        {/* Right panel — settings */}
        <div className="w-[280px] shrink-0 space-y-6">
          <div className="bg-card rounded-2xl border-2 border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">⚙️ Настройки</h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Сложность</p>
                <div className="space-y-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                        difficulty === level
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {difficultyLabels[level].emoji} {difficultyLabels[level].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Визуальные подсказки</Label>
                <Switch checked={showHints} onCheckedChange={setShowHints} />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm font-bold">Кол-во элементов</Label>
                  <span className="text-sm font-bold tabular-nums text-primary">{elementCount[0]}</span>
                </div>
                <Slider value={elementCount} onValueChange={setElementCount} min={3} max={12} step={1} />
              </div>
            </div>
          </div>

          <Button className="w-full h-12 gap-2 text-base font-bold rounded-xl transition-all duration-200 active:scale-[0.98]">
            <Save className="h-5 w-5" /> Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorPage;
