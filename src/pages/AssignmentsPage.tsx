import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { taskListsApi, groupsApi, childrenApi, educatorsApi, representativesApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import type { TaskList, TaskListItem, Task, ChildGroup, ChildGroupMember, Child, Educator, LegalRepresentative, TaskTemplate } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ListTodo, Trash2, Users, Search, ArrowUp, ArrowDown, X, CheckCircle2, ChevronDown, Baby, UsersRound } from 'lucide-react';
import { toast } from 'sonner';

const difficultyLabel: Record<string, string> = { Easy: '🟢 Лёгкий', Medium: '🟡 Средний', Hard: '🔴 Сложный' };

const setsEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every(x => b.includes(x));

const AssignmentsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [, setEducator] = useState<Educator | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [items, setItems] = useState<TaskListItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [groups, setGroups] = useState<ChildGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<ChildGroupMember[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [reps, setReps] = useState<LegalRepresentative[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState<'individual' | 'groups'>('individual');
  const [openGroupChainIds, setOpenGroupChainIds] = useState<Set<number>>(new Set());

  // форма
  const [form, setForm] = useState({ Title: '', Descripti: '', date_complite: '' });
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);

  // фильтры селектора заданий
  const [taskSearch, setTaskSearch] = useState('');
  const [taskTemplateFilter, setTaskTemplateFilter] = useState<number | 0>(0);
  const [taskDiffFilter, setTaskDiffFilter] = useState<string>('');
  const [onlyMine, setOnlyMine] = useState(true);

  const canManage = role === 'admin' || role === 'educator';

  const loadItemsFor = async (allLists: TaskList[]) => {
    const allItems: TaskListItem[] = [];
    for (const l of allLists) allItems.push(...await taskListsApi.getItems(l.PK_id));
    setItems(allItems);
  };

  const reload = async () => {
    let visibleLists: TaskList[] = [];
    if (role === 'educator' && user) {
      const ed = await educatorsApi.getByUserId(user.PK_UserId);
      setEducator(ed);
      if (ed) {
        visibleLists = await taskListsApi.getByTeacher(user.PK_UserId);
        const gs = await groupsApi.getByEducator(ed.PK_EducatorId);
        setGroups(gs);
        const allMembers: ChildGroupMember[] = [];
        for (const g of gs) allMembers.push(...await groupsApi.getMembers(g.PK_GroupId));
        setGroupMembers(allMembers);
      }
    } else if (role === 'admin') {
      visibleLists = await taskListsApi.getAll();
      setGroups(await groupsApi.getAll());
    }
    setLists(visibleLists);
    await loadItemsFor(visibleLists);
  };

  useEffect(() => {
    reload();
    tasksApi.getTasks().then(setTasks);
    tasksApi.getTemplates().then(setTemplates);
    representativesApi.getAll().then(setReps);
    if (role === 'educator' && user) {
      (async () => {
        const ed = await educatorsApi.getByUserId(user.PK_UserId);
        const all = await childrenApi.getAll();
        setChildren(ed ? all.filter(c => c.FK_EducatorId === ed.PK_EducatorId) : []);
      })();
    } else {
      childrenApi.getAll().then(setChildren);
    }
  }, [user, role]);

  const openCreate = () => {
    setForm({ Title: '', Descripti: '', date_complite: '' });
    setSelectedTasks([]); setSelectedGroups([]); setSelectedChildren([]);
    setTaskSearch(''); setTaskTemplateFilter(0); setTaskDiffFilter(''); setOnlyMine(true);
    setDialogOpen(true);
  };

  const availableTasks = useMemo(() => {
    let base = tasks;
    if (onlyMine && user) base = base.filter(t => t.FK_UserId === user.PK_UserId || t.IsPublished);
    if (taskTemplateFilter) base = base.filter(t => t.FK_TemplateId === taskTemplateFilter);
    if (taskDiffFilter) base = base.filter(t => t.DifficultyLevel === taskDiffFilter);
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      base = base.filter(t => t.Title.toLowerCase().includes(q) || (t.Descripti?.toLowerCase().includes(q) ?? false));
    }
    return base;
  }, [tasks, taskSearch, taskTemplateFilter, taskDiffFilter, onlyMine, user]);

  const toggleTask = (id: number) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const moveTask = (id: number, dir: -1 | 1) => {
    setSelectedTasks(prev => {
      const idx = prev.indexOf(id);
      const ni = idx + dir;
      if (idx < 0 || ni < 0 || ni >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
      return copy;
    });
  };

  const handleCreate = async () => {
    if (!form.Title.trim()) { toast.error('Введите название цепочки'); return; }
    if (selectedTasks.length === 0) { toast.error('Выберите хотя бы одно задание'); return; }

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
  };

  const handleDelete = async (listId: number) => {
    if (await taskListsApi.delete(listId)) {
      toast.success('Цепочка удалена');
      reload();
    }
  };

  const getChildByUserId = (uid: number) => {
    const rep = reps.find(r => r.FK_UserId === uid);
    return children.find(c => c.FK_RepresentativeId === rep?.PK_RepresentativeId);
  };
  const getChildNameByUserId = (uid: number) => {
    const child = getChildByUserId(uid);
    const rep = reps.find(r => r.FK_UserId === uid);
    return child?.FullName || rep?.FullName || `User #${uid}`;
  };
  const getTaskTitle = (tid: number) => tasks.find(t => t.PK_TaskId === tid)?.Title || `#${tid}`;

  /* ── Группировка цепочек по типу: индивидуальные / групповые ── */
  type Enriched = {
    list: TaskList;
    listItems: TaskListItem[];
    recipientUserIds: number[];
    matchedGroup: ChildGroup | null;
    perChild: { userId: number; total: number; done: number; isDone: boolean }[];
    total: number; done: number; allDone: boolean;
  };

  const enrichedLists: Enriched[] = useMemo(() => {
    return lists.map(l => {
      const listItems = items.filter(i => i.task_list_id === l.PK_id);
      const recipientUserIds = [...new Set(listItems.map(i => i.user_id))];

      // Подбираем группу, члены которой (через rep→user) точно равны получателям
      let matchedGroup: ChildGroup | null = null;
      for (const g of groups) {
        const members = groupMembers.filter(m => m.FK_GroupId === g.PK_GroupId);
        const memberUserIds = members
          .map(m => {
            const c = children.find(ch => ch.PK_ChildId === m.FK_ChildId);
            const r = reps.find(rr => rr.PK_RepresentativeId === c?.FK_RepresentativeId);
            return r?.FK_UserId;
          })
          .filter((x): x is number => typeof x === 'number');
        if (memberUserIds.length > 1 && setsEqual(memberUserIds, recipientUserIds)) {
          matchedGroup = g; break;
        }
      }

      const perChild = recipientUserIds.map(uid => {
        const u = listItems.filter(i => i.user_id === uid);
        const done = u.filter(i => i.complited).length;
        return { userId: uid, total: u.length, done, isDone: u.length > 0 && done === u.length };
      });
      const total = listItems.length;
      const done = listItems.filter(i => i.complited).length;
      const allDone = total > 0 && done === total;
      return { list: l, listItems, recipientUserIds, matchedGroup, perChild, total, done, allDone };
    });
  }, [lists, items, groups, groupMembers, children, reps]);

  const individualLists = enrichedLists.filter(e => !e.matchedGroup);
  const groupLists = enrichedLists.filter(e => e.matchedGroup);

  const toggleOpenGroupChain = (id: number) => {
    setOpenGroupChainIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  /* ── UI карточки ── */
  const ChainHeader = ({ e, icon }: { e: Enriched; icon: React.ReactNode }) => (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${e.allDone ? 'bg-success/15' : 'bg-primary/10'}`}>
        {e.allDone ? <CheckCircle2 className="h-5 w-5 text-success" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-foreground truncate">
          {e.list.Title}
          {e.allDone && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-bold">Завершена</span>}
        </p>
        {e.list.Descripti && <p className="text-xs text-muted-foreground truncate">{e.list.Descripti}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
          <span className="text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{e.recipientUserIds.length} учеников</span>
          <span className="text-success font-semibold">✓ {e.done}/{e.total} шагов</span>
          {e.list.date_complite && <span className="text-warning font-semibold">⏰ до {new Date(e.list.date_complite).toLocaleDateString('ru')}</span>}
        </div>
      </div>
    </div>
  );

  const DeleteWhenDone = ({ e }: { e: Enriched }) => (
    e.allDone ? (
      <Button onClick={() => handleDelete(e.list.PK_id)} variant="destructive" className="rounded-xl gap-2 font-bold shrink-0">
        <Trash2 className="h-4 w-4" /> Удалить завершённую
      </Button>
    ) : (
      canManage && (
        <button onClick={() => handleDelete(e.list.PK_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 shrink-0" aria-label="Удалить">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      )
    )
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">📋 Цепочки заданий</h1>
        {canManage && (
          <Button onClick={openCreate} className="gap-2 rounded-xl font-bold h-11">
            <Plus className="h-4 w-4" /> Назначить
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'individual' | 'groups')}>
        <TabsList className="mb-4">
          <TabsTrigger value="individual" className="gap-2"><Baby className="h-4 w-4" /> Отдельные дети ({individualLists.length})</TabsTrigger>
          <TabsTrigger value="groups" className="gap-2"><UsersRound className="h-4 w-4" /> Группы ({groupLists.length})</TabsTrigger>
        </TabsList>

        {/* === Отдельные дети === */}
        <TabsContent value="individual" className="space-y-3">
          {individualLists.map(e => (
            <div key={e.list.PK_id} className={`bg-card border-2 rounded-2xl p-5 transition-all ${e.allDone ? 'border-success bg-success/5' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <ChainHeader e={e} icon={<ListTodo className="h-5 w-5 text-primary" />} />
                <DeleteWhenDone e={e} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {e.perChild.map(pc => (
                  <span key={pc.userId} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pc.isDone ? 'bg-success/15 text-success' : 'bg-accent/40 text-accent-foreground'}`}>
                    {pc.isDone && '✓ '}{getChildNameByUserId(pc.userId)} · {pc.done}/{pc.total}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {individualLists.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-muted-foreground font-bold">Нет цепочек у отдельных детей</p>
            </div>
          )}
        </TabsContent>

        {/* === Группы === */}
        <TabsContent value="groups" className="space-y-3">
          {groupLists.map(e => {
            const isOpen = openGroupChainIds.has(e.list.PK_id);
            return (
              <Collapsible key={e.list.PK_id} open={isOpen} onOpenChange={() => toggleOpenGroupChain(e.list.PK_id)}>
                <div className={`bg-card border-2 rounded-2xl p-5 transition-all ${e.allDone ? 'border-success bg-success/5' : 'border-border'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <ChainHeader e={e} icon={<UsersRound className="h-5 w-5 text-primary" />} />
                    <DeleteWhenDone e={e} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                      {e.matchedGroup?.GroupName}
                    </span>
                    <CollapsibleTrigger asChild>
                      <button className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto">
                        {isOpen ? 'Скрыть детей' : 'Показать детей группы'}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {e.perChild.map(pc => (
                      <div key={pc.userId} className={`flex items-center justify-between rounded-xl px-3 py-2 ${pc.isDone ? 'bg-success/10' : 'bg-muted/40'}`}>
                        <div className="flex items-center gap-2">
                          {pc.isDone
                            ? <CheckCircle2 className="h-4 w-4 text-success" />
                            : <ListTodo className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-bold text-sm">{getChildNameByUserId(pc.userId)}</span>
                        </div>
                        <span className={`text-xs font-bold ${pc.isDone ? 'text-success' : 'text-muted-foreground'}`}>
                          {pc.isDone ? 'Цепочка выполнена' : `${pc.done}/${pc.total} шагов`}
                        </span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
          {groupLists.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-muted-foreground font-bold">Нет цепочек, назначенных группам</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Назначить цепочку заданий</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold">Название цепочки *</Label>
                <Input value={form.Title} onChange={e => setForm(f => ({ ...f, Title: e.target.value }))} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Срок выполнения</Label>
                <Input type="datetime-local" value={form.date_complite} onChange={e => setForm(f => ({ ...f, date_complite: e.target.value }))} className="rounded-xl h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Описание</Label>
              <Input value={form.Descripti} onChange={e => setForm(f => ({ ...f, Descripti: e.target.value }))} className="rounded-xl h-11" />
            </div>

            {/* === Удобный выбор заданий === */}
            <div className="space-y-3 border-2 border-border rounded-xl p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-foreground">Задания * <span className="text-muted-foreground font-normal text-xs">(порядок ниже = порядок прохождения)</span></Label>
                <span className="text-xs font-bold text-primary">Выбрано: {selectedTasks.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={taskSearch} onChange={e => setTaskSearch(e.target.value)} placeholder="Поиск..." className="rounded-xl h-10 pl-9 text-sm" />
                </div>
                <select value={taskTemplateFilter} onChange={e => setTaskTemplateFilter(Number(e.target.value))} className="rounded-xl border-2 border-border bg-card px-3 h-10 text-sm font-medium">
                  <option value={0}>Все шаблоны</option>
                  {templates.map(t => <option key={t.PK_TemplateId} value={t.PK_TemplateId}>{t.TemplateName}</option>)}
                </select>
                <select value={taskDiffFilter} onChange={e => setTaskDiffFilter(e.target.value)} className="rounded-xl border-2 border-border bg-card px-3 h-10 text-sm font-medium">
                  <option value="">Любая сложность</option>
                  <option value="Easy">🟢 Лёгкий</option>
                  <option value="Medium">🟡 Средний</option>
                  <option value="Hard">🔴 Сложный</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={onlyMine} onCheckedChange={v => setOnlyMine(!!v)} />
                <span className="font-semibold">Только мои + публичные</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Доступные ({availableTasks.length})</p>
                  <div className="border-2 border-border rounded-xl bg-card max-h-64 overflow-y-auto divide-y divide-border">
                    {availableTasks.map(t => {
                      const checked = selectedTasks.includes(t.PK_TaskId);
                      const tmpl = templates.find(x => x.PK_TemplateId === t.FK_TemplateId);
                      return (
                        <button
                          key={t.PK_TaskId}
                          type="button"
                          onClick={() => toggleTask(t.PK_TaskId)}
                          className={`w-full text-left p-2.5 hover:bg-accent/30 transition-colors flex items-start gap-2 ${checked ? 'bg-primary/5' : ''}`}
                        >
                          <Checkbox checked={checked} className="mt-0.5 pointer-events-none" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{t.Title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tmpl?.TemplateName || '—'} · {t.DifficultyLevel ? difficultyLabel[t.DifficultyLevel] : ''}
                              {!t.IsPublished && <span className="ml-1 text-warning">🔒</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    {availableTasks.length === 0 && (
                      <p className="p-4 text-xs text-muted-foreground text-center">Ничего не найдено</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Цепочка ({selectedTasks.length})</p>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 max-h-64 overflow-y-auto p-2 space-y-1.5">
                    {selectedTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">Выберите задания слева — они появятся здесь</p>
                    )}
                    {selectedTasks.map((tid, idx) => (
                      <div key={tid} className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-2">
                        <span className="text-xs font-extrabold text-primary w-5 text-center">{idx + 1}</span>
                        <span className="flex-1 text-sm font-bold truncate">{getTaskTitle(tid)}</span>
                        <button type="button" onClick={() => moveTask(tid, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => moveTask(tid, 1)} disabled={idx === selectedTasks.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => toggleTask(tid)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Получатели */}
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
