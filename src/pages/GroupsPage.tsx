import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsApi, childrenApi, educatorsApi } from '@/services/entitiesApi';
import type { ChildGroup, ChildGroupMember, Child, Educator } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Users, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface GroupCard {
  group: ChildGroup;
  members: ChildGroupMember[];
}

const GroupsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [educator, setEducator] = useState<Educator | null>(null);
  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState<number | null>(null);
  const [groupName, setGroupName] = useState('');

  const reload = async (eduId: number) => {
    const list = await groupsApi.getByEducator(eduId);
    const cards: GroupCard[] = [];
    for (const g of list) {
      const m = await groupsApi.getMembers(g.PK_GroupId);
      cards.push({ group: g, members: m });
    }
    setGroups(cards);
  };

  useEffect(() => {
    if (!user) return;
    if (role === 'admin') {
      // админ видит всех детей и все группы
      childrenApi.getAll().then(setChildren);
      groupsApi.getAll().then(async list => {
        const cards: GroupCard[] = [];
        for (const g of list) cards.push({ group: g, members: await groupsApi.getMembers(g.PK_GroupId) });
        setGroups(cards);
      });
    } else if (role === 'educator') {
      educatorsApi.getByUserId(user.PK_UserId).then(async e => {
        setEducator(e);
        if (e) {
          // педагог видит в выборе только своих детей
          const all = await childrenApi.getAll();
          setChildren(all.filter(c => c.FK_EducatorId === e.PK_EducatorId));
          reload(e.PK_EducatorId);
        }
      });
    }
  }, [user, role]);

  const handleCreate = async () => {
    if (!groupName.trim() || !educator) { toast.error('Введите название группы'); return; }
    await groupsApi.create({ GroupName: groupName, FK_EducatorId: educator.PK_EducatorId });
    setGroupName(''); setCreateOpen(false);
    reload(educator.PK_EducatorId);
    toast.success('Группа создана');
  };

  const handleDelete = async (id: number) => {
    if (await groupsApi.delete(id)) {
      if (educator) reload(educator.PK_EducatorId);
      toast.success('Группа удалена');
    }
  };

  const handleAddMember = async (groupId: number, childId: number) => {
    await groupsApi.addMember(groupId, childId);
    if (educator) reload(educator.PK_EducatorId);
  };

  const handleRemoveMember = async (memberId: number) => {
    await groupsApi.removeMember(memberId);
    if (educator) reload(educator.PK_EducatorId);
  };

  const getChildName = (id: number) => children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">👥 Группы учеников</h1>
        {role === 'educator' && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-xl font-bold h-11">
            <Plus className="h-4 w-4" /> Создать группу
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(({ group, members }) => (
          <div key={group.PK_GroupId} className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{group.GroupName}</p>
                  <p className="text-xs text-muted-foreground">{members.length} учеников</p>
                </div>
              </div>
              {role === 'educator' && (
                <button onClick={() => handleDelete(group.PK_GroupId)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              {members.map(m => (
                <div key={m.PK_MemberId} className="flex items-center justify-between bg-accent/30 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-semibold">{getChildName(m.FK_ChildId)}</span>
                  {role === 'educator' && (
                    <button onClick={() => handleRemoveMember(m.PK_MemberId)} className="p-1 rounded hover:bg-destructive/10">
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="text-xs text-muted-foreground italic">Нет участников</p>}
            </div>

            {role === 'educator' && (
              <Button size="sm" variant="outline" onClick={() => setMemberOpen(group.PK_GroupId)} className="w-full gap-2 rounded-lg">
                <UserPlus className="h-3.5 w-3.5" /> Добавить ученика
              </Button>
            )}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-muted-foreground font-bold">Нет групп</p>
          </div>
        )}
      </div>

      {/* Создание группы */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Новая группа</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Название группы *</Label>
              <Input value={groupName} onChange={e => setGroupName(e.target.value)} className="rounded-xl h-11" placeholder="Например: «Радуга»" />
            </div>
            <Button onClick={handleCreate} className="w-full h-11 font-bold rounded-xl">Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Добавление участника */}
      <Dialog open={memberOpen !== null} onOpenChange={() => setMemberOpen(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Добавить ученика в группу</DialogTitle></DialogHeader>
          <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto">
            {children.map(c => {
              const inGroup = groups.find(g => g.group.PK_GroupId === memberOpen)?.members.some(m => m.FK_ChildId === c.PK_ChildId);
              return (
                <button
                  key={c.PK_ChildId}
                  disabled={inGroup}
                  onClick={() => { if (memberOpen) handleAddMember(memberOpen, c.PK_ChildId); setMemberOpen(null); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="font-semibold text-sm">{c.FullName}</span>
                  {inGroup && <span className="text-xs text-muted-foreground">уже в группе</span>}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsPage;
