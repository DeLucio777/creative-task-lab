import React, { useState, useEffect } from 'react';
import { representativesApi } from '@/services/entitiesApi';
import type { LegalRepresentative } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RepresentativesPage: React.FC = () => {
  const [reps, setReps] = useState<LegalRepresentative[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ FullName: '', RelationType: '', Phone: '', Email: '' });

  useEffect(() => { representativesApi.getAll().then(setReps); }, []);

  const filtered = reps.filter(r => !search || r.FullName.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!form.FullName.trim()) { toast.error('Введите ФИО'); return; }
    const created = await representativesApi.create(form);
    if (created) { setReps(prev => [...prev, created]); toast.success('Представитель добавлен'); }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (await representativesApi.delete(id)) {
      setReps(prev => prev.filter(r => r.PK_RepresentativeId !== id));
      toast.success('Удалено');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">👨‍👩‍👧 Законные представители</h1>
        <Button onClick={() => { setForm({ FullName: '', RelationType: '', Phone: '', Email: '' }); setDialogOpen(true); }} className="gap-2 rounded-xl font-bold h-11">
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-xl h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(rep => (
          <div key={rep.PK_RepresentativeId} className="bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{rep.FullName}</p>
                  {rep.RelationType && <p className="text-xs text-muted-foreground">{rep.RelationType}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(rep.PK_RepresentativeId)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
            {rep.Email && <p className="text-xs text-muted-foreground">📧 {rep.Email}</p>}
            {rep.Phone && <p className="text-xs text-muted-foreground">📞 {rep.Phone}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">👨‍👩‍👧</p>
            <p className="text-muted-foreground font-bold">Нет представителей</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Добавить представителя</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label className="font-semibold">ФИО *</Label><Input value={form.FullName} onChange={e => setForm(f => ({ ...f, FullName: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Тип (мать/отец/опекун)</Label><Input value={form.RelationType} onChange={e => setForm(f => ({ ...f, RelationType: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Телефон</Label><Input value={form.Phone} onChange={e => setForm(f => ({ ...f, Phone: e.target.value }))} className="rounded-xl h-11" /></div>
            <div className="space-y-2"><Label className="font-semibold">Email</Label><Input value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))} className="rounded-xl h-11" /></div>
            <Button onClick={handleSave} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RepresentativesPage;
