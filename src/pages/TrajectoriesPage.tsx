import React, { useState, useEffect } from 'react';
import { trajectoriesApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import type { LearningTrajectory, Task } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Route, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const TrajectoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [trajectories, setTrajectories] = useState<LearningTrajectory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ TrajectoryName: '', Descripti: '' });

  useEffect(() => {
    trajectoriesApi.getAll().then(setTrajectories);
    tasksApi.getTasks().then(setTasks);
  }, []);

  const handleCreate = async () => {
    if (!form.TrajectoryName.trim()) { toast.error('Введите название'); return; }
    const created = await trajectoriesApi.create({ ...form, FK_EducatorId: user?.PK_UserId || 0 });
    if (created) { setTrajectories(prev => [...prev, created]); toast.success('Траектория создана'); }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">🛤️ Траектории обучения</h1>
        <Button onClick={() => { setForm({ TrajectoryName: '', Descripti: '' }); setDialogOpen(true); }} className="gap-2 rounded-xl font-bold h-11">
          <Plus className="h-4 w-4" /> Создать
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trajectories.map(t => (
          <div key={t.PK_TrajectoryId} className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{t.TrajectoryName}</p>
                {t.Descripti && <p className="text-xs text-muted-foreground">{t.Descripti}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Цепочка заданий</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-semibold text-primary">Настроить →</span>
            </div>
          </div>
        ))}
        {trajectories.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">🛤️</p>
            <p className="text-muted-foreground font-bold">Нет траекторий</p>
            <p className="text-sm text-muted-foreground mt-1">Создайте цепочку заданий для последовательного обучения</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Новая траектория</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label className="font-semibold">Название *</Label><Input value={form.TrajectoryName} onChange={e => setForm(f => ({ ...f, TrajectoryName: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Описание</Label><Input value={form.Descripti} onChange={e => setForm(f => ({ ...f, Descripti: e.target.value }))} className="rounded-xl h-11" /></div>
            <Button onClick={handleCreate} className="w-full h-11 font-bold rounded-xl">Создать</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrajectoriesPage;
