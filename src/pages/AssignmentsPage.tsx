import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { taskListsApi, groupsApi, childrenApi, educatorsApi, representativesApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import type { TaskList, TaskListItem, Task, ChildGroup, ChildGroupMember, Child, Educator, LegalRepresentative } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ListTodo, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const AssignmentsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [educator, setEducator] = useState<Educator | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [items, setItems] = useState<TaskListItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<ChildGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<ChildGroupMember[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [reps, setReps] = useState<LegalRepresentative[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // форма создания
  const [form, setForm] = useState({ Title: '', Descripti: '', date_complite: '' });
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);

  const canManage = role === 'admin' || role === 'educator';

  const reload = async () => {
    if (role === 'educator' && user) {
      const ed = await educatorsApi.getByUserId(user.PK_UserId);
      setEducator(ed);
      if (ed) {
        const ls = await taskListsApi.getByTeacher(user.PK_UserId);
        setLists(ls);
        const gs = await groupsApi.getByEducator(ed.PK_EducatorId);
        setGroups(gs);
        const allMembers: ChildGroupMember[] = [];
        for (const g of gs) allMembers.push(...await groupsApi.getMembers(g.PK_GroupId));
        setGroupMembers(allMembers);
      }
    } else if (role === 'admin') {
      setLists(await taskListsApi.getAll());
      setGroups(await groupsApi.getAll());
    }
  };

  useEffect(() => {
    reload();
    tasksApi.getTasks().then(setTasks);
    childrenApi.getAll().then(setChildren);
    representativesApi.getAll().then(setReps);
    // загрузить элементы всех цепочек
    taskListsApi.getAll().then(async all => {
      const allItems: TaskListItem[] = [];
      for (const l of all) allItems.push(...await taskListsApi.getItems(l.PK_id));
      setItems(allItems);
    });
  }, [user, role]);

  const openCreate = () => {
    setForm({ Title: '', Descripti: '', date_complite: '' });
    setSelectedTasks([]); setSelectedGroups([]); setSelectedChildren([]);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.Title.trim()) { toast.error('Введите название цепочки'); return; }
    if (selectedTasks.length === 0) { toast.error('Выберите хотя бы одно задание'); return; }

    // Развернуть группы → user_id (через child → representative.FK_UserId)
    const targetUserIds = new Set<number>();
    selectedGroups.forEach(gid => {
      groupMembers.filter(m => m.FK_GroupId === gid).forEach(m => {
        const child = children.find(c => c.PK_ChildId === m.FK_ChildId);
        const rep = reps.find(r => r.PK_RepresentativeId === child?.FK_RepresentativeId);
        if (rep) targetUserIds.add(rep.FK_UserId);
      });
    });
    selectedChildren.forEach(cid => {
      const child = children.find(c => c.PK_ChildId === cid);
      const rep = reps.find(r => r.PK_RepresentativeId === child?.FK_RepresentativeId);
      if (rep) targetUserIds.add(rep.FK_UserId);
    });

    if (targetUserIds.size === 0) { toast.error('Выберите получателей: группу или детей'); return; }

    await taskListsApi.create({
      Title: form.Title, Descripti: form.Descripti, teacher_id: user!.PK_UserId,
      date_complite: form.date_complite || undefined,
      taskIds: selectedTasks, userIds: Array.from(targetUserIds),
    });
    setDialogOpen(false);
    toast.success(`Цепочка назначена ${targetUserIds.size} ученикам`);
    reload();
    taskListsApi.getAll().then(async all => {
      const allItems: TaskListItem[] = [];
      for (const l of all) allItems.push(...await taskListsApi.getItems(l.PK_id));
      setItems(allItems);
    });
  };

  const handleDelete = async (listId: number) => {
    if (await taskListsApi.delete(listId)) {
      toast.success('Цепочка удалена');
      reload();
    }
  };

  const getChildNameByUserId = (uid: number) => {
    const rep = reps.find(r => r.FK_UserId === uid);
    const child = children.find(c => c.FK_RepresentativeId === rep?.PK_RepresentativeId);
    return child?.FullName || rep?.FullName || `User #${uid}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">📋 Цепочки заданий</h1>
        {canManage && (
          <Button onClick={openCreate} className="gap-2 rounded-xl font-bold h-11">
            <Plus className="h-4 w-4" /> Назначить
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {lists.map(l => {
          const myItems = items.filter(i => i.task_list_id === l.PK_id);
          const recipients = [...new Set(myItems.map(i => i.user_id))];
          const total = myItems.length;
          const done = myItems.filter(i => i.complited).length;
          return (
            <div key={l.PK_id} className="bg-card border-2 border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ListTodo className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{l.Title}</p>
                    {l.Descripti && <p className="text-xs text-muted-foreground">{l.Descripti}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{recipients.length} учеников</span>
                      <span className="text-success font-semibold">✓ {done}/{total}</span>
                      {l.date_complite && <span className="text-warning font-semibold">⏰ до {new Date(l.date_complite).toLocaleDateString('ru')}</span>}
                    </div>
                  </div>
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(l.PK_id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipients.map(uid => (
                  <span key={uid} className="px-2.5 py-1 rounded-lg bg-accent/40 text-accent-foreground text-xs font-bold">
                    {getChildNameByUserId(uid)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {lists.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-muted-foreground font-bold">Нет назначенных цепочек</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Назначить цепочку заданий</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Название цепочки *</Label>
              <Input value={form.Title} onChange={e => setForm(f => ({ ...f, Title: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Описание</Label>
              <Input value={form.Descripti} onChange={e => setForm(f => ({ ...f, Descripti: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Срок выполнения</Label>
              <Input type="datetime-local" value={form.date_complite} onChange={e => setForm(f => ({ ...f, date_complite: e.target.value }))} className="rounded-xl h-11" />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Задания * (порядок = порядок выбора)</Label>
              <div className="border-2 border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                {tasks.map(t => {
                  const idx = selectedTasks.indexOf(t.PK_TaskId);
                  return (
                    <label key={t.PK_TaskId} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/30 rounded p-1">
                      <Checkbox
                        checked={idx >= 0}
                        onCheckedChange={(v) => {
                          if (v) setSelectedTasks(prev => [...prev, t.PK_TaskId]);
                          else setSelectedTasks(prev => prev.filter(x => x !== t.PK_TaskId));
                        }}
                      />
                      {idx >= 0 && <span className="text-xs font-bold text-primary">{idx + 1}.</span>}
                      <span className="font-medium">{t.Title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold">Группы</Label>
                <div className="border-2 border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {groups.map(g => (
                    <label key={g.PK_GroupId} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/30 rounded p-1">
                      <Checkbox
                        checked={selectedGroups.includes(g.PK_GroupId)}
                        onCheckedChange={(v) => {
                          if (v) setSelectedGroups(prev => [...prev, g.PK_GroupId]);
                          else setSelectedGroups(prev => prev.filter(x => x !== g.PK_GroupId));
                        }}
                      />
                      <span className="font-medium">{g.GroupName}</span>
                    </label>
                  ))}
                  {groups.length === 0 && <p className="text-xs text-muted-foreground">Групп нет</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Отдельные ученики</Label>
                <div className="border-2 border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {children.map(c => (
                    <label key={c.PK_ChildId} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/30 rounded p-1">
                      <Checkbox
                        checked={selectedChildren.includes(c.PK_ChildId)}
                        onCheckedChange={(v) => {
                          if (v) setSelectedChildren(prev => [...prev, c.PK_ChildId]);
                          else setSelectedChildren(prev => prev.filter(x => x !== c.PK_ChildId));
                        }}
                      />
                      <span className="font-medium">{c.FullName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleCreate} className="w-full h-11 font-bold rounded-xl">Назначить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
