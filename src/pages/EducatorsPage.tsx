import React, { useState, useEffect } from 'react';
import { educatorsApi } from '@/services/entitiesApi';
import type { Educator } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EducatorsPage: React.FC = () => {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ FullName: '', Specialization: '', Phone: '', Email: '' });

  useEffect(() => { educatorsApi.getAll().then(setEducators); }, []);

  const filtered = educators.filter(e => !search || e.FullName.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!form.FullName.trim()) { toast.error('Введите ФИО'); return; }
    const created = await educatorsApi.create(form);
    if (created) { setEducators(prev => [...prev, created]); toast.success('Педагог добавлен'); }
    setDialogOpen(false);
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
        <Button onClick={() => { setForm({ FullName: '', Specialization: '', Phone: '', Email: '' }); setDialogOpen(true); }} className="gap-2 rounded-xl font-bold h-11">
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(edu => (
          <div key={edu.PK_EducatorId} className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
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
              <button onClick={() => handleDelete(edu.PK_EducatorId)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
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
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Добавить педагога</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label className="font-semibold">ФИО *</Label><Input value={form.FullName} onChange={e => setForm(f => ({ ...f, FullName: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Специализация</Label><Input value={form.Specialization} onChange={e => setForm(f => ({ ...f, Specialization: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Телефон</Label><Input value={form.Phone} onChange={e => setForm(f => ({ ...f, Phone: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Email</Label><Input value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} className="rounded-xl h-11" /></div>
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducatorsPage;
