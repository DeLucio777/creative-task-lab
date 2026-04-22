import React, { useState, useEffect } from 'react';
import { childrenApi, educatorsApi, representativesApi } from '@/services/entitiesApi';
import type { Child, Educator, LegalRepresentative } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Edit2, Baby, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const ChildrenPage: React.FC = () => {
  const { user, role } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [representatives, setRepresentatives] = useState<LegalRepresentative[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const [form, setForm] = useState({ FullName: '', BirthDate: '', PerceptionFeatures: '', SpeechLevel: '', FK_EducatorId: 0, FK_RepresentativeId: 0 });

  // Только админ может изменять/добавлять/удалять детей. Педагог — только просмотр своих.
  const canEdit = role === 'admin';
  const isEducator = role === 'educator';

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
    setForm({ FullName: '', BirthDate: '', PerceptionFeatures: '', SpeechLevel: '', FK_EducatorId: 0, FK_RepresentativeId: 0 });
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
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.FullName.trim()) { toast.error('Введите ФИО ребёнка'); return; }
    const payload = {
      ...form,
      FK_EducatorId: form.FK_EducatorId || undefined,
      FK_RepresentativeId: form.FK_RepresentativeId || undefined,
    };
    if (editingChild) {
      const updated = await childrenApi.update(editingChild.PK_ChildId, payload);
      if (updated) {
        setChildren(prev => prev.map(c => c.PK_ChildId === editingChild.PK_ChildId ? { ...c, ...payload } : c));
        toast.success('Данные обновлены');
      }
    } else {
      const created = await childrenApi.create(payload);
      if (created) { setChildren(prev => [...prev, created]); toast.success('Ребёнок добавлен'); }
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (await childrenApi.delete(id)) {
      setChildren(prev => prev.filter(c => c.PK_ChildId !== id));
      toast.success('Удалено');
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
                  <button onClick={() => setViewingChild(child)} className="p-1.5 rounded-lg hover:bg-muted" title="Просмотр">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </button>
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
            <div className="space-y-2">
              <Label className="font-semibold">Представитель (родитель)</Label>
              <select className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium" value={form.FK_RepresentativeId} onChange={e => setForm(f => ({ ...f, FK_RepresentativeId: Number(e.target.value) }))}>
                <option value={0}>Не назначен</option>
                {representatives.map(r => <option key={r.PK_RepresentativeId} value={r.PK_RepresentativeId}>{r.FullName} {r.RelationType ? `(${r.RelationType})` : ''}</option>)}
              </select>
            </div>
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildrenPage;
