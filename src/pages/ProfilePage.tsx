import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi, educatorsApi, representativesApi, taskListsApi, groupsApi, achievementsApi, userInfoApi, diseasesApi } from '@/services/entitiesApi';
import { tasksApi } from '@/services/tasksApi';
import { useNavigate } from 'react-router-dom';
import type { Task, TaskList, ChildGroup, Achievement, UserAchievement, UserInfo, Disease, Educator, LegalRepresentative } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User as UserIcon, Phone, Save, BookOpen, Users, Trophy, Globe2, Lock } from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  educator: 'Педагог',
  parent: 'Законный представитель',
};

const ProfilePage: React.FC = () => {
  const { user, role, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ first_name: '', second_name: '', phone: '' });
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myLists, setMyLists] = useState<TaskList[]>([]);
  const [myGroups, setMyGroups] = useState<ChildGroup[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAch, setUserAch] = useState<UserAchievement[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [educatorRec, setEducatorRec] = useState<Educator | null>(null);
  const [repRec, setRepRec] = useState<LegalRepresentative | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({ first_name: user.first_name || '', second_name: user.second_name || '', phone: user.phone || '' });

    if (role === 'educator') {
      tasksApi.getTasks().then(all => setMyTasks(all.filter(t => t.FK_UserId === user.PK_UserId)));
      taskListsApi.getByTeacher(user.PK_UserId).then(setMyLists);
      educatorsApi.getByUserId(user.PK_UserId).then(e => {
        setEducatorRec(e);
        if (e) groupsApi.getByEducator(e.PK_EducatorId).then(setMyGroups);
      });
    }

    if (role === 'parent') {
      achievementsApi.getAll().then(setAchievements);
      achievementsApi.getByUser(user.PK_UserId).then(setUserAch);
      userInfoApi.getByUser(user.PK_UserId).then(setUserInfo);
      diseasesApi.getAll().then(setDiseases);
      representativesApi.getByUserId(user.PK_UserId).then(setRepRec);
    }
  }, [user, role]);

  const handleSave = async () => {
    if (!user) return;
    const updated = await usersApi.update(user.PK_UserId, form);
    if (updated) {
      setUser(updated);
      // Синхронизировать связанные сущности
      const fullName = `${form.second_name} ${form.first_name}`.trim();
      if (role === 'educator' && educatorRec) {
        await educatorsApi.update(educatorRec.PK_EducatorId, { FullName: fullName, Phone: form.phone });
      }
      toast.success('Профиль сохранён');
    }
  };

  const handlePublish = async (taskId: number, current?: boolean) => {
    const ok = await tasksApi.publishTask(taskId, !current);
    if (ok) {
      setMyTasks(prev => prev.map(t => t.PK_TaskId === taskId ? { ...t, IsPublished: !current } : t));
      toast.success(current ? 'Задание скрыто из общего каталога' : 'Задание опубликовано');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">👤 Личный кабинет</h1>

      {/* Карточка профиля */}
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
            <Label className="font-semibold">Фамилия</Label>
            <Input value={form.second_name} onChange={e => setForm(f => ({ ...f, second_name: e.target.value }))} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Имя</Label>
            <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Телефон</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl h-11 pl-9" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="mt-5 gap-2 rounded-xl font-bold h-11">
          <Save className="h-4 w-4" /> Сохранить
        </Button>
      </div>

      {/* Кабинет ПЕДАГОГА */}
      {role === 'educator' && (
        <>
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <h2 className="font-bold text-foreground">Мои задания ({myTasks.length})</h2>
              </div>
              <Button onClick={() => navigate('/editor/new')} variant="outline" className="rounded-xl font-bold">+ Создать</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTasks.map(t => (
                <div key={t.PK_TaskId} className="border-2 border-border rounded-xl p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-foreground text-sm">{t.Title}</p>
                    {t.IsPublished
                      ? <span className="text-xs font-bold text-success flex items-center gap-1"><Globe2 className="h-3 w-3" /> Публично</span>
                      : <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Приватно</span>
                    }
                  </div>
                  {t.Descripti && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.Descripti}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/task/${t.PK_TaskId}`)} className="rounded-lg text-xs">Открыть</Button>
                    <Button size="sm" variant={t.IsPublished ? 'outline' : 'default'} onClick={() => handlePublish(t.PK_TaskId, t.IsPublished)} className="rounded-lg text-xs">
                      {t.IsPublished ? 'Скрыть' : 'Опубликовать'}
                    </Button>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground text-center py-6">У вас пока нет заданий</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-bold text-foreground">Мои группы ({myGroups.length})</h2>
              </div>
              <Button onClick={() => navigate('/groups')} variant="outline" className="rounded-xl font-bold">Управление</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {myGroups.map(g => (
                <span key={g.PK_GroupId} className="px-3 py-1.5 rounded-xl bg-accent/50 text-accent-foreground text-sm font-bold">
                  {g.GroupName}
                </span>
              ))}
              {myGroups.length === 0 && <p className="text-sm text-muted-foreground">Нет созданных групп</p>}
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center">📚</div>
              <h2 className="font-bold text-foreground">Цепочки заданий ({myLists.length})</h2>
            </div>
            <div className="space-y-2">
              {myLists.map(l => (
                <div key={l.PK_id} className="border-2 border-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-foreground">{l.Title}</p>
                    {l.Descripti && <p className="text-xs text-muted-foreground">{l.Descripti}</p>}
                  </div>
                  {l.date_complite && <span className="text-xs text-muted-foreground">до {new Date(l.date_complite).toLocaleDateString('ru')}</span>}
                </div>
              ))}
              {myLists.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Нет цепочек</p>}
            </div>
          </div>
        </>
      )}

      {/* Кабинет РОДИТЕЛЯ/РЕБЁНКА */}
      {role === 'parent' && (
        <>
          {userInfo && (
            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <h2 className="font-bold text-foreground mb-4">📋 Информация об ученике</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-xs text-muted-foreground font-semibold">Возраст</p><p className="font-bold">{userInfo.age ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Заболевание</p><p className="font-bold text-sm">{diseases.find(d => d.PK_Id === userInfo.FK_disease_id)?.name || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Выполнено</p><p className="font-bold text-success">{userInfo.complited_tasks_count ?? 0}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Подсказок</p><p className="font-bold text-warning">{userInfo.helpe_used_count ?? 0}</p></div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-warning" />
              </div>
              <h2 className="font-bold text-foreground">Мои достижения ({userAch.length} / {achievements.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievements.map(a => {
                const earned = userAch.find(ua => ua.achivement_id === a.id);
                return (
                  <div key={a.id} className={`border-2 rounded-2xl p-4 text-center transition-all ${earned ? 'border-warning bg-warning/5' : 'border-border opacity-50'}`}>
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
    </div>
  );
};

export default ProfilePage;
