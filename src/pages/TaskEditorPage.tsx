import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Plus, GripVertical, Trash2 } from 'lucide-react';
import { MOCK_PECS } from '@/data/mockData';

interface TimelineSlot {
  id: string;
  pecsId?: number;
  label: string;
}

const TaskEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [showHints, setShowHints] = useState(true);
  const [elementCount, setElementCount] = useState([6]);
  const [timeline, setTimeline] = useState<TimelineSlot[]>([
    { id: '1', label: 'Шаг 1' },
    { id: '2', label: 'Шаг 2' },
    { id: '3', label: 'Шаг 3' },
  ]);

  const addSlot = () => {
    setTimeline(prev => [...prev, { id: String(Date.now()), label: `Шаг ${prev.length + 1}` }]);
  };

  const removeSlot = (slotId: string) => {
    setTimeline(prev => prev.filter(s => s.id !== slotId));
  };

  const assignPecs = (slotId: string, pecsId: number) => {
    setTimeline(prev =>
      prev.map(s => (s.id === slotId ? { ...s, pecsId } : s))
    );
  };

  const difficultyLabels: Record<string, string> = {
    Easy: 'Лёгкий', Medium: 'Средний', Hard: 'Сложный',
  };

  return (
    <div>
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Назад
      </button>

      <div className="flex gap-6">
        {/* Main canvas */}
        <div className="flex-1 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isNew ? 'Новое задание' : 'Редактирование задания'}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Введите название задания" />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Описание задания..."
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Рабочая область</h3>
            <div
              className="min-h-[300px] rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center"
              style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
              <p className="text-sm text-muted-foreground">Перетащите PECS-карточки из библиотеки</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-foreground">Шкала времени</h3>
              <Button variant="outline" size="sm" onClick={addSlot} className="gap-1">
                <Plus className="h-3 w-3" /> Добавить шаг
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {timeline.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="min-w-[120px] bg-muted/30 border border-border rounded-lg p-3 flex flex-col items-center gap-2 shrink-0"
                >
                  <div className="flex items-center gap-1 w-full">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground flex-1">Шаг {idx + 1}</span>
                    <button onClick={() => removeSlot(slot.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {slot.pecsId ? (
                    <div className="w-16 h-16 bg-card border border-border rounded-md flex items-center justify-center">
                      <img src="/placeholder.svg" alt="" className="w-12 h-12 object-contain" />
                    </div>
                  ) : (
                    <select
                      className="w-full text-xs rounded border border-input bg-background p-1"
                      onChange={e => assignPecs(slot.id, Number(e.target.value))}
                      defaultValue=""
                    >
                      <option value="" disabled>PECS...</option>
                      {MOCK_PECS.map(p => (
                        <option key={p.PK_PECSid} value={p.PK_PECSid}>{p.Descripti}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — settings */}
        <div className="w-[280px] shrink-0 space-y-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Настройки</h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Сложность</p>
                <div className="space-y-1">
                  {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        difficulty === level
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {difficultyLabels[level]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Визуальные подсказки</Label>
                <Switch checked={showHints} onCheckedChange={setShowHints} />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Кол-во элементов</Label>
                  <span className="text-sm font-medium tabular-nums text-foreground">{elementCount[0]}</span>
                </div>
                <Slider value={elementCount} onValueChange={setElementCount} min={3} max={12} step={1} />
              </div>
            </div>
          </div>

          <Button className="w-full gap-2 transition-all duration-200 active:scale-[0.98]">
            <Save className="h-4 w-4" /> Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditorPage;
