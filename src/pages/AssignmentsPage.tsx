import React, { useState, useEffect } from 'react';
import { assignmentsApi, childrenApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import type { TaskAssignment, Child, Task } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, CheckCircle2, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const statusLabel: Record<string, { text: string; icon: React.ElementType; color: string }> = {
  pending: { text: 'Ожидает', icon: Clock, color: 'text-warning' },
  in_progress: { text: 'В процессе', icon: Play, color: 'text-primary' },
  completed: { text: 'Выполнено', icon: CheckCircle2, color: 'text-accent-foreground' },
};

const AssignmentsPage: React.FC = () => {
  const { role } = useAuth();
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ FK_TaskId: 0, FK_ChildId: 0, DueDate: '' });

  useEffect(() => {
    assignmentsApi.getAll().then(setAssignments);
    childrenApi.getAll().then(setChildren);
    tasksApi.getTasks().then(setTasks);
  }, []);

  const handleCreate = async () => {
    if (!form.FK_TaskId || !form.FK_ChildId) { toast.error('Выберите задание и ребёнка'); return; }
    const created = await assignmentsApi.create({ ...form, DueDate: form.DueDate || undefined });
    if (created) { setAssignments(prev => [...prev, created]); toast.success('Задание назначено'); }
    setDialogOpen(false);
  };

  const getChildName = (id: number) => children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;
  const getTaskTitle = (id: number) => tasks.find(t => t.PK_TaskId === id)?.Title || `#${id}`;

  const canAssign = role === 'admin' || role === 'educator';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">📋 Назначения заданий</h1>
        {canAssign && (
          <Button onClick={() => { setForm({ FK_TaskId: 0, FK_ChildId: 0, DueDate: '' }); setDialogOpen(true); }} className="gap-2 rounded-xl font-bold h-11">
            <Plus className="h-4 w-4" /> Назначить
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {assignments.map(a => {
          const st = statusLabel[a.Status] || statusLabel.pending;
          const StIcon = st.icon;
          return (
            <div key={a.PK_AssignmentId} className="bg-card border-2 border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{getTaskTitle(a.FK_TaskId)}</p>
                <p className="text-xs text-muted-foreground">Ребёнок: {getChildName(a.FK_ChildId)}</p>
                {a.DueDate && <p className="text-xs text-muted-foreground">Срок: {new Date(a.DueDate).toLocaleDateString('ru')}</p>}
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${st.color}`}>
                <StIcon className="h-4 w-4" /> {st.text}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-muted-foreground font-bold">Нет назначений</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Назначить задание</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Задание *</Label>
              <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={form.FK_TaskId} onChange={e => setForm(f => ({ ...f, FK_TaskId: Number(e.target.value) }))}>
                <option value={0} disabled>Выберите задание...</option>
                {tasks.map(t => <option key={t.PK_TaskId} value={t.PK_TaskId}>{t.Title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Ребёнок *</Label>
              <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={form.FK_ChildId} onChange={e => setForm(f => ({ ...f, FK_ChildId: Number(e.target.value) }))}>
                <option value={0} disabled>Выберите ребёнка...</option>
                {children.map(c => <option key={c.PK_ChildId} value={c.PK_ChildId}>{c.FullName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Срок выполнения</Label>
              <Input type="datetime-local" value={form.DueDate} onChange={e => setForm(f => ({ ...f, DueDate: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <Button onClick={handleCreate} className="w-full h-11 font-bold rounded-xl">Назначить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
