import React, { useState, useEffect } from 'react';
import { childrenApi, educatorsApi, representativesApi } from '@/services/entitiesApi';
import { authApi } from '@/services/authApi';
import type { Child, Educator, LegalRepresentative } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Edit2, Baby, Users, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { fullNameSchema, loginSchema, passwordSchema, validate } from '@/lib/validation';
import { z } from 'zod';

const ChildrenPage: React.FC = () => {
  const { user, role } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [representatives, setRepresentatives] = useState<LegalRepresentative[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const [form, setForm] = useState({ FullName: '', BirthDate: '', PerceptionFeatures: '', SpeechLevel: '', FK_EducatorId: 0, FK_RepresentativeId: 0, UserLogin: '', UserPassword: '' });

  // Админ — полный CRUD. Педагог — может только редактировать уровень речи у своих детей.
  const canEdit = role === 'admin';
  const isEducator = role === 'educator';
  const [speechEditChild, setSpeechEditChild] = useState<Child | null>(null);
  const [speechValue, setSpeechValue] = useState('');

  useEffect(() => {
    (async () => {
      const [allChildren, allEducators, allReps] = await Promise.all([
        childrenApi.getAll(), educatorsApi.getAll(), representativesApi.getAll(),
      ]);
      setEducators(allEducators);
      setRepresentatives(allReps);
      if (isEducator && user) {
        const me = allEducators.find(e => e.FK_UserId === user.PK_UserId);
        setChildren(me ? allChildren.filter(c => c.FK_EducatorId === me.PK_EducatorId) : []);
      } else {
        setChildren(allChildren);
      }
    })();
  }, [user, role, isEducator]);

  const filtered = children.filter(c =>
    !search || c.FullName.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingChild(null);
    setForm({ FullName: '', BirthDate: '', PerceptionFeatures: '', SpeechLevel: '', FK_EducatorId: 0, FK_RepresentativeId: 0, UserLogin: '', UserPassword: '' });
    setDialogOpen(true);
  };

  const openEdit = (child: Child) => {
    setEditingChild(child);
    setForm({
      FullName: child.FullName,
      BirthDate: child.BirthDate || '',
      PerceptionFeatures: child.PerceptionFeatures || '',
      SpeechLevel: child.SpeechLevel || '',
      FK_EducatorId: child.FK_EducatorId || 0,
      FK_RepresentativeId: child.FK_RepresentativeId || 0,
      UserLogin: '', UserPassword: '',
    });
    setDialogOpen(true);
  };

  const childCreateSchema = z.object({
    FullName: fullNameSchema,
    UserLogin: loginSchema,
    UserPassword: passwordSchema,
  });

  const handleSave = async () => {
    const corePayload = {
      FullName: form.FullName.trim(),
      BirthDate: form.BirthDate,
      PerceptionFeatures: form.PerceptionFeatures,
      SpeechLevel: form.SpeechLevel,
      FK_EducatorId: form.FK_EducatorId || undefined,
      FK_RepresentativeId: form.FK_RepresentativeId || undefined,
    };
    if (editingChild) {
      if (!corePayload.FullName) { toast.error('Введите ФИО ребёнка'); return; }
      const updated = await childrenApi.update(editingChild.PK_ChildId, corePayload);
      if (updated) {
        setChildren(prev => prev.map(c => c.PK_ChildId === editingChild.PK_ChildId ? { ...c, ...corePayload } : c));
        toast.success('Данные обновлены');
      }
    } else {
      // Админ создаёт ребёнка вместе с учётной записью (логин/пароль)
      const errs = validate(childCreateSchema, form);
      if (errs.length) { toast.error(errs[0].message); return; }
      const newUser = await authApi.registerUser({
        login: form.UserLogin, password: form.UserPassword, roleId: 3,
        first_name: corePayload.FullName.split(' ')[1], second_name: corePayload.FullName.split(' ')[0],
      });
      if (!newUser) { toast.error('Логин уже занят'); return; }
      // Создаём представителя на этого пользователя (для авторизации)
      const rep = await representativesApi.create({
        FullName: corePayload.FullName, RelationType: 'сам', FK_UserId: newUser.PK_UserId,
      });
      const payload = { ...corePayload, FK_RepresentativeId: corePayload.FK_RepresentativeId || rep?.PK_RepresentativeId, RegisteredDate: new Date().toISOString() };
      const created = await childrenApi.create(payload);
      if (created) {
        setChildren(prev => [...prev, created]);
        toast.success(`Ребёнок добавлен. Логин: ${form.UserLogin}`);
      }
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (await childrenApi.delete(id)) {
      setChildren(prev => prev.filter(c => c.PK_ChildId !== id));
      toast.success('Удалено');
    }
  };

  const openSpeechEdit = (child: Child) => {
    setSpeechEditChild(child);
    setSpeechValue(child.SpeechLevel || '');
  };

  const handleSpeechSave = async () => {
    if (!speechEditChild) return;
    const updated = await childrenApi.update(speechEditChild.PK_ChildId, { SpeechLevel: speechValue });
    if (updated) {
      setChildren(prev => prev.map(c => c.PK_ChildId === speechEditChild.PK_ChildId ? { ...c, SpeechLevel: speechValue } : c));
      toast.success('Уровень речи обновлён');
      setSpeechEditChild(null);
    }
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return '—';
    const diff = Date.now() - new Date(birthDate).getTime();
    return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} лет`;
  };

  const getRepName = (id?: number) => representatives.find(r => r.PK_RepresentativeId === id);
  const getEduName = (id?: number) => educators.find(e => e.PK_EducatorId === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">👶 Дети</h1>
        {canEdit && (
          <Button onClick={openCreate} className="gap-2 rounded-xl font-bold h-11">
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        )}
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(child => {
          const rep = getRepName(child.FK_RepresentativeId);
          const edu = getEduName(child.FK_EducatorId);
          return (
            <div key={child.PK_ChildId} className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Baby className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{child.FullName}</p>
                    <p className="text-xs text-muted-foreground">{getAge(child.BirthDate)}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(child)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(child.PK_ChildId)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                )}
                {isEducator && (
                  <div className="flex gap-1">
                    <button onClick={() => openSpeechEdit(child)} className="p-1.5 rounded-lg hover:bg-primary/10" title="Изменить уровень речи">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </button>
                    <button onClick={() => setViewingChild(child)} className="p-1.5 rounded-lg hover:bg-muted" title="Просмотр">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
              {child.SpeechLevel && <p className="text-xs text-muted-foreground mb-1">🗣️ Речь: {child.SpeechLevel}</p>}
              {child.PerceptionFeatures && <p className="text-xs text-muted-foreground mb-1">👁️ Восприятие: {child.PerceptionFeatures}</p>}
              {edu && (
                <p className="text-xs text-primary font-semibold mt-2">
                  🎓 Педагог: {edu.FullName}
                </p>
              )}
              {rep && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">{rep.FullName}</span>
                    {rep.RelationType && <span>({rep.RelationType})</span>}
                  </div>
                  {rep.Phone && <p className="text-xs text-muted-foreground ml-5">📞 {rep.Phone}</p>}
                  {rep.Email && <p className="text-xs text-muted-foreground ml-5">📧 {rep.Email}</p>}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">👶</p>
            <p className="text-muted-foreground font-bold">Нет записей</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingChild ? 'Редактировать' : 'Добавить ребёнка'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">ФИО *</Label>
              <Input value={form.FullName} onChange={e => setForm(f => ({ ...f, FullName: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Дата рождения</Label>
              <Input type="date" value={form.BirthDate} onChange={e => setForm(f => ({ ...f, BirthDate: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Уровень речевого развития</Label>
              <Input value={form.SpeechLevel} onChange={e => setForm(f => ({ ...f, SpeechLevel: e.target.value }))} className="rounded-xl h-11" placeholder="Например: базовый, развитый..." />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Особенности восприятия</Label>
              <Input value={form.PerceptionFeatures} onChange={e => setForm(f => ({ ...f, PerceptionFeatures: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Педагог</Label>
              <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={form.FK_EducatorId} onChange={e => setForm(f => ({ ...f, FK_EducatorId: Number(e.target.value) }))}>
                <option value={0}>Не назначен</option>
                {educators.map(e => <option key={e.PK_EducatorId} value={e.PK_EducatorId}>{e.FullName}</option>)}
              </select>
            </div>
            {!editingChild && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-bold text-foreground">🔐 Учётные данные ребёнка для входа</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="font-semibold">Логин *</Label><Input value={form.UserLogin} onChange={e => setForm(f => ({ ...f, UserLogin: e.target.value }))} maxLength={40} className="rounded-xl h-11" placeholder="например ivanov_petya" /></div>
                  <div className="space-y-2"><Label className="font-semibold">Пароль *</Label><Input type="password" value={form.UserPassword} onChange={e => setForm(f => ({ ...f, UserPassword: e.target.value }))} maxLength={64} className="rounded-xl h-11" /></div>
                </div>
              </div>
            )}
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра для педагога */}
      <Dialog open={!!viewingChild} onOpenChange={(o) => !o && setViewingChild(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Профиль ребёнка</DialogTitle>
          </DialogHeader>
          {viewingChild && (() => {
            const rep = getRepName(viewingChild.FK_RepresentativeId);
            const edu = getEduName(viewingChild.FK_EducatorId);
            return (
              <div className="space-y-3 mt-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Baby className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-base">{viewingChild.FullName}</p>
                    <p className="text-xs text-muted-foreground">{getAge(viewingChild.BirthDate)}</p>
                  </div>
                </div>
                {viewingChild.BirthDate && <p><span className="font-semibold">📅 Дата рождения:</span> {new Date(viewingChild.BirthDate).toLocaleDateString('ru')}</p>}
                {viewingChild.SpeechLevel && <p><span className="font-semibold">🗣️ Речь:</span> {viewingChild.SpeechLevel}</p>}
                {viewingChild.PerceptionFeatures && <p><span className="font-semibold">👁️ Восприятие:</span> {viewingChild.PerceptionFeatures}</p>}
                {edu && <p><span className="font-semibold">🎓 Педагог:</span> {edu.FullName}</p>}
                {rep && (
                  <div className="pt-2 border-t border-border space-y-1">
                    <p className="font-semibold">👪 Представитель</p>
                    <p>{rep.FullName} {rep.RelationType && `(${rep.RelationType})`}</p>
                    {rep.Phone && <p className="text-muted-foreground">📞 {rep.Phone}</p>}
                    {rep.Email && <p className="text-muted-foreground">📧 {rep.Email}</p>}
                  </div>
                )}
                <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                  Полное редактирование доступно администратору. Педагог может изменять только уровень речи.
                </p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования уровня речи (педагог) */}
      <Dialog open={!!speechEditChild} onOpenChange={(o) => !o && setSpeechEditChild(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Уровень речи: {speechEditChild?.FullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Уровень речевого развития</Label>
              <Input
                value={speechValue}
                onChange={e => setSpeechValue(e.target.value)}
                placeholder="Например: базовый, развитый, невербальный..."
                className="rounded-xl h-11"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Педагог может редактировать только это поле. Остальные данные ребёнка изменяет администратор.
              </p>
            </div>
            <Button onClick={handleSpeechSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildrenPage;
