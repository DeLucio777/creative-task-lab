import React, { useState, useEffect } from 'react';
import { childrenApi, educatorsApi, diseasesApi, usersApi } from '@/services/entitiesApi';
import { authApi } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContext';
import type { Child, Disease } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Edit2, Baby, Eye, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBelarusPhone, isValidBelarusPhone, BY_PHONE_PLACEHOLDER } from '@/lib/phone';
import { fullNameSchema, loginSchema, passwordSchema, optionalEmail, validate } from '@/lib/validation';
import { z } from 'zod';

const ChildrenPage: React.FC = () => {
  const { user, role } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [search, setSearch] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const empty = { FullName: '', age: '', speak_level: '', FK_disease_id: 0, email: '', phone: '', UserLogin: '', UserPassword: '', NewPassword: '' };
  const [form, setForm] = useState(empty);

  const canEdit = role === 'admin';
  const isEducator = role === 'educator';
  const [speechEditChild, setSpeechEditChild] = useState<Child | null>(null);
  const [speechValue, setSpeechValue] = useState('');

  useEffect(() => {
    (async () => {
      diseasesApi.getAll().then(setDiseases);
      const all = await childrenApi.getAll();
      if (isEducator && user) {
        const my = await childrenApi.getByEducator(user.PK_UserId);
        const ids = new Set(my.map(c => c.PK_ChildId));
        setChildren(all.filter(c => ids.has(c.PK_ChildId)));
      } else {
        setChildren(all);
      }
    })();
  }, [user, role, isEducator]);

  const filtered = children.filter(c => {
    if (search && !c.FullName.toLowerCase().includes(search.toLowerCase())) return false;
    if (ageMin && (c.age == null || c.age < Number(ageMin))) return false;
    if (ageMax && (c.age == null || c.age > Number(ageMax))) return false;
    if (diseaseFilter && c.FK_disease_id !== diseaseFilter) return false;
    return true;
  });

  const openCreate = () => { setEditingChild(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (c: Child) => {
    setEditingChild(c);
    setForm({
      FullName: c.FullName,
      age: c.age?.toString() ?? '',
      speak_level: c.speak_level ?? '',
      FK_disease_id: c.FK_disease_id ?? 0,
      email: c.email ?? '',
      phone: c.phone ?? '',
      UserLogin: '', UserPassword: '', NewPassword: '',
    });
    setDialogOpen(true);
  };

  const createSchema = z.object({
    FullName: fullNameSchema,
    UserLogin: loginSchema,
    UserPassword: passwordSchema,
    email: optionalEmail,
  });
  const editSchema = z.object({ FullName: fullNameSchema, email: optionalEmail });

  const handleSave = async () => {
    const patch = {
      FullName: form.FullName.trim(),
      age: form.age ? Number(form.age) : undefined,
      speak_level: form.speak_level || undefined,
      FK_disease_id: form.FK_disease_id || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    };
    if (form.phone && !isValidBelarusPhone(form.phone)) { toast.error('Неверный формат телефона'); return; }
    if (patch.age !== undefined && (!Number.isFinite(patch.age) || patch.age < 1)) {
      toast.error('Возраст должен быть не меньше 1'); return;
    }

    if (editingChild) {
      const errs = validate(editSchema, form);
      if (errs.length) { toast.error(errs[0].message); return; }
      const upd = await childrenApi.update(editingChild.PK_ChildId, patch);
      if (upd) {
        setChildren(prev => prev.map(c => c.PK_ChildId === editingChild.PK_ChildId ? upd : c));
        // Admin может менять логин/пароль
        const credPatch: Partial<{ UserLogin: string; UserPassword: string }> = {};
        if (form.UserLogin.trim()) credPatch.UserLogin = form.UserLogin.trim();
        if (form.NewPassword) {
          if (form.NewPassword.length < 4) { toast.error('Пароль: мин. 4 символа'); return; }
          credPatch.UserPassword = form.NewPassword;
        }
        if (Object.keys(credPatch).length) await usersApi.update(editingChild.PK_ChildId, credPatch);
        toast.success('Данные обновлены');
      }
    } else {
      const errs = validate(createSchema, form);
      if (errs.length) { toast.error(errs[0].message); return; }
      const parts = patch.FullName.split(/\s+/);
      const u = await authApi.registerUser({
        login: form.UserLogin, password: form.UserPassword, roleId: 1,
        second_name: parts[0], first_name: parts.slice(1).join(' ') || undefined,
        phone: form.phone || undefined, email: form.email || undefined,
      });
      if (!u) return;
      await childrenApi.update(u.PK_UserId, patch);
      const fresh = await childrenApi.getById(u.PK_UserId);
      if (fresh) setChildren(prev => [...prev, fresh]);
      toast.success(`Ребёнок добавлен. Логин: ${form.UserLogin}`);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (await childrenApi.delete(id)) {
      setChildren(prev => prev.filter(c => c.PK_ChildId !== id));
      toast.success('Удалено');
    }
  };

  const openSpeechEdit = (c: Child) => { setSpeechEditChild(c); setSpeechValue(c.speak_level || ''); };
  const handleSpeechSave = async () => {
    if (!speechEditChild) return;
    const upd = await childrenApi.update(speechEditChild.PK_ChildId, { speak_level: speechValue });
    if (upd) {
      setChildren(prev => prev.map(c => c.PK_ChildId === speechEditChild.PK_ChildId ? upd : c));
      toast.success('Уровень речи обновлён');
      setSpeechEditChild(null);
    }
  };

  const diseaseName = (id?: number) => diseases.find(d => d.PK_Id === id)?.name;

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

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
        </div>
        <Input type="number" min={1} value={ageMin} onChange={e => setAgeMin(e.target.value)} placeholder="Возраст от" className="rounded-xl h-11 w-32" />
        <Input type="number" min={1} value={ageMax} onChange={e => setAgeMax(e.target.value)} placeholder="до" className="rounded-xl h-11 w-24" />
        <select
          value={diseaseFilter}
          onChange={e => setDiseaseFilter(Number(e.target.value))}
          className="rounded-xl border-2 border-border bg-card px-3 h-11 text-sm font-medium"
        >
          <option value={0}>Все болезни</option>
          {diseases.map(d => <option key={d.PK_Id} value={d.PK_Id}>{d.name}</option>)}
        </select>
        {(search || ageMin || ageMax || diseaseFilter) && (
          <button
            onClick={() => { setSearch(''); setAgeMin(''); setAgeMax(''); setDiseaseFilter(0); }}
            className="px-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            Сбросить
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.PK_ChildId} className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Baby className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{c.FullName}</p>
                  <p className="text-xs text-muted-foreground">{c.age != null ? `${c.age} лет` : '—'}</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(c.PK_ChildId)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              )}
              {isEducator && (
                <div className="flex gap-1">
                  <button onClick={() => openSpeechEdit(c)} className="p-1.5 rounded-lg hover:bg-primary/10" title="Изменить уровень речи">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </button>
                  <button onClick={() => setViewingChild(c)} className="p-1.5 rounded-lg hover:bg-muted" title="Просмотр">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
            {c.speak_level && <p className="text-xs text-muted-foreground mb-1">🗣️ Речь: {c.speak_level}</p>}
            {diseaseName(c.FK_disease_id) && <p className="text-xs text-muted-foreground mb-1">🩺 {diseaseName(c.FK_disease_id)}</p>}
            {c.email && <p className="text-xs text-muted-foreground">📧 {c.email}</p>}
            {c.phone && <p className="text-xs text-muted-foreground">📞 {c.phone}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">👶</p>
            <p className="text-muted-foreground font-bold">Нет записей</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingChild ? 'Редактировать' : 'Добавить ребёнка'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">ФИО *</Label>
              <Input value={form.FullName} onChange={e => setForm(f => ({ ...f, FullName: e.target.value }))} className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold">Возраст</Label>
                <Input type="number" min={1} max={100} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Уровень речи</Label>
                <Input value={form.speak_level} onChange={e => setForm(f => ({ ...f, speak_level: e.target.value }))} className="rounded-xl h-11" placeholder="базовый, развитый..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Заболевание</Label>
              <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={form.FK_disease_id} onChange={e => setForm(f => ({ ...f, FK_disease_id: Number(e.target.value) }))}>
                <option value={0}>Не указано</option>
                {diseases.map(d => <option key={d.PK_Id} value={d.PK_Id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: formatBelarusPhone(e.target.value) }))} placeholder={BY_PHONE_PLACEHOLDER} className="rounded-xl h-11" />
              </div>
            </div>
            {!editingChild ? (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-bold text-foreground">🔐 Учётные данные</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="font-semibold">Логин *</Label><Input value={form.UserLogin} onChange={e => setForm(f => ({ ...f, UserLogin: e.target.value }))} maxLength={40} className="rounded-xl h-11" /></div>
                  <div className="space-y-2"><Label className="font-semibold">Пароль *</Label><Input type="password" value={form.UserPassword} onChange={e => setForm(f => ({ ...f, UserPassword: e.target.value }))} maxLength={64} className="rounded-xl h-11" /></div>
                </div>
              </div>
            ) : (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-bold text-foreground">🔐 Учётные данные (опционально)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="font-semibold">Новый логин</Label><Input value={form.UserLogin} onChange={e => setForm(f => ({ ...f, UserLogin: e.target.value }))} maxLength={40} placeholder="оставьте пустым" className="rounded-xl h-11" /></div>
                  <div className="space-y-2"><Label className="font-semibold">Новый пароль</Label><Input type="password" value={form.NewPassword} onChange={e => setForm(f => ({ ...f, NewPassword: e.target.value }))} maxLength={64} placeholder="оставьте пустым" className="rounded-xl h-11" /></div>
                </div>
              </div>
            )}
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingChild} onOpenChange={(o) => !o && setViewingChild(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Профиль ребёнка</DialogTitle></DialogHeader>
          {viewingChild && (
            <div className="space-y-3 mt-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Baby className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-foreground text-base">{viewingChild.FullName}</p>
                  <p className="text-xs text-muted-foreground">{viewingChild.age != null ? `${viewingChild.age} лет` : '—'}</p>
                </div>
              </div>
              {viewingChild.speak_level && <p><span className="font-semibold">🗣️ Речь:</span> {viewingChild.speak_level}</p>}
              {diseaseName(viewingChild.FK_disease_id) && <p><span className="font-semibold">🩺 Заболевание:</span> {diseaseName(viewingChild.FK_disease_id)}</p>}
              {viewingChild.email && <p><span className="font-semibold">📧</span> {viewingChild.email}</p>}
              {viewingChild.phone && <p><span className="font-semibold">📞</span> {viewingChild.phone}</p>}
              <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                Полное редактирование доступно администратору. Педагог может изменять только уровень речи.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!speechEditChild} onOpenChange={(o) => !o && setSpeechEditChild(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Уровень речи: {speechEditChild?.FullName}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Уровень речевого развития</Label>
              <Input value={speechValue} onChange={e => setSpeechValue(e.target.value)} className="rounded-xl h-11" autoFocus />
            </div>
            <Button onClick={handleSpeechSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildrenPage;
