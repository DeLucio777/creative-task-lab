import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, educatorsApi, taskListsApi, groupsApi, achievementsApi, childInfoApi, diseasesApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import { mediaApi } from '@/services/mediaApi';
import { useNavigate } from 'react-router-dom';
import type { Task, TaskList, ChildGroup, Achievement, UserAchievement, ChildInfo, Disease, Educator, MediaCatalog, CatalogPECS } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { User as UserIcon, Phone, Save, BookOpen, Users, Trophy, Globe2, Lock, Mail, Plus, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { formatBelarusPhone, isValidBelarusPhone, BY_PHONE_PLACEHOLDER } from '@/lib/phone';


const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  educator: 'Педагог',
  parent: 'Представитель/ребёнок',
};

const ProfilePage: React.FC = () => {
  const { user, role, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    UserLogin: '', UserPassword: '',
    first_name: '', second_name: '',
    phone: '', email: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myLists, setMyLists] = useState<TaskList[]>([]);
  const [myGroups, setMyGroups] = useState<ChildGroup[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAch, setUserAch] = useState<UserAchievement[]>([]);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [educatorRec, setEducatorRec] = useState<Educator | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [achDialog, setAchDialog] = useState<{ id?: number; name: string; description: string; image_id?: number } | null>(null);
  const [mediaList, setMediaList] = useState<MediaCatalog[]>([]);
  const [pecsListAll, setPecsListAll] = useState<CatalogPECS[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isManager = role === 'admin' || role === 'educator';
  const canEditAch = (a: Achievement) => role === 'admin' || a.created_by === user?.PK_UserId;

  const loadAchievements = () => achievementsApi.getAll().then(setAllAchievements);

  useEffect(() => {
    if (!user) return;
    usersApi.getById(user.PK_UserId).then(fresh => {
      const src = fresh ?? user;
      if (fresh) setUser(fresh);
      setForm({
        UserLogin: src.UserLogin || '',
        UserPassword: '',
        first_name: src.first_name || '',
        second_name: src.second_name || '',
        phone: src.phone || '',
        email: src.email || '',
      });
      setPasswordConfirm('');
    });

    if (role === 'educator') {
      tasksApi.getTasks().then(all => setMyTasks(all.filter(t => t.FK_UserId === user.PK_UserId)));
      taskListsApi.getByTeacher(user.PK_UserId).then(setMyLists);
      educatorsApi.getByUserId(user.PK_UserId).then(e => {
        setEducatorRec(e);
        if (e) groupsApi.getByEducator(user.PK_UserId).then(setMyGroups);
      });
    }

    if (role === 'parent') {
      achievementsApi.getAll().then(setAchievements);
      achievementsApi.getByUser(user.PK_UserId).then(setUserAch);
      childInfoApi.getAll().then(all => setChildInfo(all.find(i => i.FK_user_id === user.PK_UserId) ?? null));
      diseasesApi.getAll().then(setDiseases);
    }

    if (role === 'admin' || role === 'educator') {
      loadAchievements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.PK_UserId, role]);

  const saveAchievement = async () => {
    if (!achDialog || !user) return;
    const name = achDialog.name.trim();
    if (!name) { toast.error('Введите название'); return; }
    if (achDialog.id) {
      const upd = await achievementsApi.update(achDialog.id, { name, description: achDialog.description });
      if (upd) { setAchDialog(null); loadAchievements(); toast.success('Достижение обновлено'); }
    } else {
      const c = await achievementsApi.create({ name, description: achDialog.description, created_by: user.PK_UserId });
      if (c) { setAchDialog(null); loadAchievements(); toast.success('Достижение создано'); }
    }
  };

  const deleteAchievement = async (id: number) => {
    if (await achievementsApi.delete(id)) { loadAchievements(); toast.success('Удалено'); }
  };

  const handleSave = async () => {
    if (!user) return;
    const login = form.UserLogin.trim();
    if (!login) { toast.error('Логин обязателен'); return; }
    if (form.UserPassword && form.UserPassword.length < 4) { toast.error('Пароль: мин. 4 символа'); return; }
    if (form.UserPassword && form.UserPassword !== passwordConfirm) { toast.error('Пароли не совпадают'); return; }
    if (form.phone && !isValidBelarusPhone(form.phone)) { toast.error('Неверный формат телефона'); return; }
    if (login.toLowerCase() !== (user.UserLogin || '').toLowerCase()) {
      if (await usersApi.isLoginTaken(login)) { toast.error(`Логин «${login}» уже занят`); return; }
    }
    const payload: Partial<typeof user> = {
      UserLogin: login,
      first_name: form.first_name,
      second_name: form.second_name,
      phone: form.phone,
      email: form.email,
    };
    if (form.UserPassword) payload.UserPassword = form.UserPassword;
    const updated = await usersApi.update(user.PK_UserId, payload);
    if (updated) {
      setUser(updated);
      if (role === 'educator' && educatorRec) {
        await educatorsApi.update(educatorRec.PK_EducatorId, {
          FullName: `${form.second_name} ${form.first_name}`.trim(),
          Phone: form.phone, Email: form.email,
        });
      }
      setForm(f => ({ ...f, UserPassword: '' }));
      setPasswordConfirm('');
      toast.success('Профиль сохранён');
    }
  };

  const handlePublish = async (taskId: number, current?: boolean) => {
    const ok = await tasksApi.publishTask(taskId, !current);
    if (ok) {
      setMyTasks(prev => prev.map(t => t.PK_TaskId === taskId ? { ...t, public_task: !current } : t));
      toast.success(current ? 'Скрыто' : 'Опубликовано');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">👤 Личный кабинет</h1>

      <div className="bg-card rounded-2xl border-2 border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">{user.UserLogin}</p>
            <p className="text-xs text-muted-foreground font-semibold">{roleLabels[role] ?? role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold">Логин</Label>
            <Input value={form.UserLogin} onChange={e => setForm(f => ({ ...f, UserLogin: e.target.value }))} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Новый пароль</Label>
            <Input type="password" value={form.UserPassword} onChange={e => setForm(f => ({ ...f, UserPassword: e.target.value }))} placeholder="Оставьте пустым" className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Подтвердите пароль</Label>
            <Input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} disabled={!form.UserPassword} className="rounded-xl h-11 disabled:opacity-70" />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Фамилия</Label>
            <Input value={form.second_name} onChange={e => setForm(f => ({ ...f, second_name: e.target.value }))} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Имя</Label>
            <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl h-11 pl-9" placeholder="email@example.com" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="font-semibold">Телефон</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: formatBelarusPhone(e.target.value) }))}
                onFocus={() => { if (!form.phone) setForm(f => ({ ...f, phone: '+375 ' })); }}
                placeholder={BY_PHONE_PLACEHOLDER}
                className={`rounded-xl h-11 pl-9 ${form.phone && !isValidBelarusPhone(form.phone) ? 'border-destructive' : ''}`}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="mt-5 gap-2 rounded-xl font-bold h-11">
          <Save className="h-4 w-4" /> Сохранить
        </Button>
      </div>

      {role === 'educator' && (
        <>
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center"><BookOpen className="h-5 w-5 text-accent-foreground" /></div>
                <h2 className="font-bold text-foreground">Мои задания ({myTasks.length})</h2>
              </div>
              <Button onClick={() => navigate('/editor/new')} variant="outline" className="rounded-xl font-bold">+ Создать</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTasks.map(t => (
                <div key={t.PK_TaskId} className="border-2 border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-foreground text-sm">{t.Title}</p>
                    {t.public_task
                      ? <span className="text-xs font-bold text-success flex items-center gap-1"><Globe2 className="h-3 w-3" /> Публично</span>
                      : <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Приватно</span>}
                  </div>
                  {t.Descripti && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.Descripti}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/task/${t.PK_TaskId}`)} className="rounded-lg text-xs">Открыть</Button>
                    <Button size="sm" variant={t.public_task ? 'outline' : 'default'} onClick={() => handlePublish(t.PK_TaskId, t.public_task)} className="rounded-lg text-xs">
                      {t.public_task ? 'Скрыть' : 'Опубликовать'}
                    </Button>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && <p className="col-span-full text-sm text-muted-foreground text-center py-6">Нет заданий</p>}
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                <h2 className="font-bold text-foreground">Мои группы ({myGroups.length})</h2>
              </div>
              <Button onClick={() => navigate('/groups')} variant="outline" className="rounded-xl font-bold">Управление</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {myGroups.map(g => (
                <span key={g.PK_Id} className="px-3 py-1.5 rounded-xl bg-accent/50 text-accent-foreground text-sm font-bold">
                  {g.GroupName || `Группа #${g.PK_Id}`}
                </span>
              ))}
              {myGroups.length === 0 && <p className="text-sm text-muted-foreground">Нет групп</p>}
            </div>
          </div>
        </>
      )}

      {role === 'parent' && (
        <>
          {childInfo && (
            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <h2 className="font-bold text-foreground mb-4">📋 Информация об ученике</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-xs text-muted-foreground font-semibold">Возраст</p><p className="font-bold">{childInfo.age ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Уровень речи</p><p className="font-bold text-sm">{childInfo.speak_level || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Заболевание</p><p className="font-bold text-sm">{diseases.find(d => d.PK_Id === childInfo.FK_disease_id)?.name || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Выполнено</p><p className="font-bold text-success">{childInfo.complited_tasks_count ?? 0}</p></div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center"><Trophy className="h-5 w-5 text-warning" /></div>
              <h2 className="font-bold text-foreground">Мои достижения ({userAch.length} / {achievements.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievements.map(a => {
                const earned = userAch.find(ua => ua.achivement_id === a.id);
                return (
                  <div key={a.id} className={`border-2 rounded-2xl p-4 text-center ${earned ? 'border-warning bg-warning/5' : 'border-border opacity-50'}`}>
                    <p className="text-3xl mb-2">{earned ? '🏆' : '🔒'}</p>
                    <p className="font-bold text-sm text-foreground">{a.name}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {isManager && (
        <div className="bg-card rounded-2xl border-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center"><Trophy className="h-5 w-5 text-warning" /></div>
              <h2 className="font-bold text-foreground">🏆 Каталог достижений ({allAchievements.length})</h2>
            </div>
            <Button onClick={() => setAchDialog({ name: '', description: '' })} variant="outline" className="rounded-xl font-bold gap-2">
              <Plus className="h-4 w-4" /> Создать
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allAchievements.map(a => {
              const editable = canEditAch(a);
              return (
                <div key={a.id} className="border-2 border-border rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      <p className="font-bold text-sm text-foreground">{a.name || '—'}</p>
                    </div>
                    {editable && (
                      <div className="flex gap-1">
                        <button onClick={() => setAchDialog({ id: a.id, name: a.name ?? '', description: a.description ?? '' })} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                        <button onClick={() => deleteAchievement(a.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                      </div>
                    )}
                  </div>
                  {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  {!editable && <p className="text-xs italic text-muted-foreground mt-2">Только для просмотра</p>}
                </div>
              );
            })}
            {allAchievements.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground text-center py-6">Достижений пока нет</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!achDialog} onOpenChange={(o) => !o && setAchDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{achDialog?.id ? 'Редактировать достижение' : 'Новое достижение'}</DialogTitle></DialogHeader>
          {achDialog && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="font-semibold">Название *</Label>
                <Input value={achDialog.name} onChange={e => setAchDialog({ ...achDialog, name: e.target.value })} maxLength={120} className="rounded-xl h-11" autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Описание</Label>
                <Textarea value={achDialog.description} onChange={e => setAchDialog({ ...achDialog, description: e.target.value })} maxLength={500} className="rounded-xl" rows={3} />
              </div>
              <Button onClick={saveAchievement} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
