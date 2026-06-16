import React, { useState, useEffect } from 'react';
import { educatorsApi, usersApi } from '@/services/entitiesApi';
import { authApi } from '@/services/authApi';
import type { Educator } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Edit2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatBelarusPhone, isValidBelarusPhone, BY_PHONE_PLACEHOLDER } from '@/lib/phone';
import { z } from 'zod';
import { fullNameSchema, optionalEmail, loginSchema, passwordSchema, validate } from '@/lib/validation';

const createSchema = z.object({
  FullName: fullNameSchema,
  Specialization: z.string().trim().max(100).optional(),
  Phone: z.string().trim().refine(v => !v || isValidBelarusPhone(v), 'Телефон должен быть в формате +375 (XX) XXX-XX-XX').optional(),
  Email: optionalEmail,
  UserLogin: loginSchema,
  UserPassword: passwordSchema,
});

const editSchema = createSchema.omit({ UserLogin: true, UserPassword: true });

const EducatorsPage: React.FC = () => {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Educator | null>(null);
  const empty = { FullName: '', Specialization: '', Phone: '', Email: '', UserLogin: '', UserPassword: '', NewPassword: '' };
  const [form, setForm] = useState(empty);

  useEffect(() => { educatorsApi.getAll().then(setEducators); }, []);

  const filtered = educators.filter(e => !search || e.FullName.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (e: Educator) => {
    setEditing(e);
    setForm({ FullName: e.FullName, Specialization: e.Specialization || '', Phone: e.Phone || '', Email: e.Email || '', UserLogin: '', UserPassword: '', NewPassword: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      const errs = validate(editSchema, form);
      if (errs.length) { toast.error(errs[0].message); return; }
      const upd = await educatorsApi.update(editing.PK_EducatorId, {
        FullName: form.FullName.trim(), Specialization: form.Specialization, Phone: form.Phone, Email: form.Email,
      });
      if (upd) {
        const credPatch: Partial<{ UserLogin: string; UserPassword: string }> = {};
        if (form.UserLogin.trim()) credPatch.UserLogin = form.UserLogin.trim();
        if (form.NewPassword) {
          if (form.NewPassword.length < 4) { toast.error('Пароль: мин. 4 символа'); return; }
          credPatch.UserPassword = form.NewPassword;
        }
        if (Object.keys(credPatch).length) await usersApi.update(editing.PK_EducatorId, credPatch);
        setEducators(prev => prev.map(e => e.PK_EducatorId === editing.PK_EducatorId ? upd : e));
        toast.success('Изменения сохранены');
        setDialogOpen(false);
      }
      return;
    }
    const errs = validate(createSchema, form);
    if (errs.length) { toast.error(errs[0].message); return; }
    const u = await authApi.registerUser({
      login: form.UserLogin, password: form.UserPassword, roleId: 2,
      first_name: form.FullName.split(' ')[1], second_name: form.FullName.split(' ')[0],
      phone: form.Phone, email: form.Email,
    });
    if (!u) return;
    const created = await educatorsApi.update(u.PK_UserId, {
      FullName: form.FullName, Specialization: form.Specialization, Phone: form.Phone, Email: form.Email,
    });
    if (created) {
      setEducators(prev => [...prev, created]);
      toast.success('Педагог зарегистрирован');
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (await educatorsApi.delete(id)) {
      setEducators(prev => prev.filter(e => e.PK_EducatorId !== id));
      toast.success('Удалено');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">🎓 Педагоги</h1>
        <Button onClick={openCreate} className="gap-2 rounded-xl font-bold h-11">
          <Plus className="h-4 w-4" /> Зарегистрировать
        </Button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(edu => (
          <div key={edu.PK_EducatorId} className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{edu.FullName}</p>
                  {edu.Specialization && <p className="text-xs text-muted-foreground">{edu.Specialization}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(edu)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(edu.PK_EducatorId)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
            {edu.Email && <p className="text-xs text-muted-foreground">📧 {edu.Email}</p>}
            {edu.Phone && <p className="text-xs text-muted-foreground">📞 {edu.Phone}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-muted-foreground font-bold">Нет педагогов</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать педагога' : 'Регистрация педагога'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label className="font-semibold">ФИО *</Label><Input value={form.FullName} onChange={e => setForm(f => ({ ...f, FullName: e.target.value }))} maxLength={120} className="rounded-xl h-11" placeholder="Фамилия Имя Отчество" /></div>
            <div className="space-y-2"><Label className="font-semibold">Специализация</Label><Input value={form.Specialization} onChange={e => setForm(f => ({ ...f, Specialization: e.target.value }))} maxLength={100} className="rounded-xl h-11" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="font-semibold">Телефон</Label><Input value={form.Phone} onChange={e => setForm(f => ({ ...f, Phone: formatBelarusPhone(e.target.value) }))} onFocus={() => { if (!form.Phone) setForm(f => ({ ...f, Phone: '+375 ' })); }} placeholder={BY_PHONE_PLACEHOLDER} inputMode="tel" className={`rounded-xl h-11 ${form.Phone && !isValidBelarusPhone(form.Phone) ? 'border-destructive' : ''}`} /></div>
              <div className="space-y-2"><Label className="font-semibold">Email</Label><Input type="email" value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} maxLength={255} className="rounded-xl h-11" /></div>
            </div>
            {!editing && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-bold text-foreground">🔐 Учётные данные для входа</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="font-semibold">Логин *</Label><Input value={form.UserLogin} onChange={e => setForm(f => ({ ...f, UserLogin: e.target.value }))} maxLength={40} className="rounded-xl h-11" /></div>
                  <div className="space-y-2"><Label className="font-semibold">Пароль *</Label><Input type="password" value={form.UserPassword} onChange={e => setForm(f => ({ ...f, UserPassword: e.target.value }))} maxLength={64} className="rounded-xl h-11" /></div>
                </div>
              </div>
            )}
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">{editing ? 'Сохранить' : 'Зарегистрировать'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducatorsPage;
