import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsApi, childrenApi, educatorsApi } from '@/services/entitiesApi';
import type { ChildGroup, ChildGroupMember, Child, Educator } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Users, UserPlus, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface GroupCard { group: ChildGroup; members: ChildGroupMember[] }

const GroupsPage: React.FC = () => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const isEducator = role === 'educator';
  const canManage = isAdmin || isEducator;

  const [educators, setEducators] = useState<Educator[]>([]);
  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState<number | null>(null);
  const [renameGroup, setRenameGroup] = useState<ChildGroup | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [groupName, setGroupName] = useState('');
  const [createEduId, setCreateEduId] = useState<number>(0);
  const [memberSearch, setMemberSearch] = useState('');


  const loadGroups = useCallback(async () => {
    const list = isAdmin ? await groupsApi.getAll()
      : user ? await groupsApi.getByEducator(user.PK_UserId) : [];
    const allMembers = await groupsApi.getAllMembers();
    setGroups(list.map(g => ({ group: g, members: allMembers.filter(m => m.FK_group_id === g.PK_Id) })));
  }, [isAdmin, user]);

  useEffect(() => {
    if (!user) return;
    educatorsApi.getAll().then(setEducators);
    if (isEducator) childrenApi.getByEducator(user.PK_UserId).then(setAllChildren);
    else childrenApi.getAll().then(setAllChildren);
  }, [user, isEducator]);

  useEffect(() => { if (user) loadGroups(); }, [user, loadGroups]);

  const handleCreate = async () => {
    if (!groupName.trim()) { toast.error('Введите название группы'); return; }
    const teacherId = isAdmin ? createEduId : user?.PK_UserId || 0;
    if (!teacherId) { toast.error('Выберите педагога'); return; }
    await groupsApi.create({ GroupName: groupName.trim(), FK_Teacher_id: teacherId });
    setGroupName(''); setCreateEduId(0); setCreateOpen(false);
    loadGroups();
    toast.success('Группа создана');
  };

  const handleDelete = async (id: number) => {
    if (await groupsApi.delete(id)) { loadGroups(); toast.success('Группа удалена'); }
  };

  const handleRename = async () => {
    if (!renameGroup) return;
    const name = renameValue.trim();
    if (!name) { toast.error('Введите название'); return; }
    const upd = await groupsApi.update(renameGroup.PK_Id, { GroupName: name });
    if (upd) { setRenameGroup(null); loadGroups(); toast.success('Название обновлено'); }
  };


  const handleAddMember = async (groupId: number, userId: number) => {
    await groupsApi.addMember(groupId, userId);
    loadGroups();
  };

  const handleRemoveMember = async (memberId: number) => {
    await groupsApi.removeMember(memberId);
    loadGroups();
  };

  const getChildName = (id: number) => allChildren.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;
  const getEduName = (id: number) => educators.find(e => e.PK_EducatorId === id)?.FullName || `#${id}`;

  return (
    <div>
      <div className="page-sticky-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">👥 Группы учеников</h1>
          {canManage && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-xl font-bold h-11">
              <Plus className="h-4 w-4" /> Создать группу
            </Button>
          )}
        </div>
      </div>
      <div className="mb-6" />


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(({ group, members }) => (
          <div key={group.PK_Id} className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{group.GroupName || `Группа #${group.PK_Id}`}</p>
                  <p className="text-xs text-muted-foreground">{members.length} учеников</p>
                  {isAdmin && <p className="text-xs text-muted-foreground">🎓 {getEduName(group.FK_Teacher_id)}</p>}
                </div>
              </div>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => { setRenameGroup(group); setRenameValue(group.GroupName || ''); }} className="p-1.5 rounded-lg hover:bg-muted" title="Переименовать">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(group.PK_Id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              {members.map(m => (
                <div key={m.PK_Id} className="flex items-center justify-between bg-accent/30 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-semibold">{getChildName(m.FK_user_id)}</span>
                  {canManage && (
                    <button onClick={() => handleRemoveMember(m.PK_Id)} className="p-1 rounded hover:bg-destructive/10">
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="text-xs text-muted-foreground italic">Нет участников</p>}
            </div>

            {canManage && (
              <Button size="sm" variant="outline" onClick={() => setMemberOpen(group.PK_Id)} className="w-full gap-2 rounded-lg">
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Новая группа</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Название группы *</Label>
              <Input value={groupName} onChange={e => setGroupName(e.target.value)} maxLength={80} className="rounded-xl h-11" />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label className="font-semibold">Педагог *</Label>
                <select value={createEduId} onChange={e => setCreateEduId(Number(e.target.value))} className="w-full text-sm rounded-xl border-2 border-border bg-card p-2.5 font-medium">
                  <option value={0}>Выберите педагога</option>
                  {educators.map(e => <option key={e.PK_EducatorId} value={e.PK_EducatorId}>{e.FullName}</option>)}
                </select>
              </div>
            )}
            <Button onClick={handleCreate} className="w-full h-11 font-bold rounded-xl">Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={memberOpen !== null} onOpenChange={(o) => { if (!o) { setMemberOpen(null); setMemberSearch(''); } }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Добавить ученика в группу</DialogTitle></DialogHeader>
          <div className="mt-2">
            <Input
              autoFocus
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="🔍 Поиск по имени..."
              className="rounded-xl h-10 mb-3"
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(() => {
                const grp = groups.find(g => g.group.PK_Id === memberOpen);
                if (!allChildren.length) return <p className="text-sm text-muted-foreground text-center py-4">Нет доступных детей</p>;
                const q = memberSearch.trim().toLowerCase();
                const filtered = q ? allChildren.filter(c => (c.FullName || '').toLowerCase().includes(q)) : allChildren;
                if (!filtered.length) return <p className="text-sm text-muted-foreground text-center py-4">Никого не найдено</p>;
                return filtered.map(c => {
                  const inGroup = grp?.members.some(m => m.FK_user_id === c.PK_ChildId);
                  return (
                    <button
                      key={c.PK_ChildId}
                      disabled={inGroup}
                      onClick={() => { if (memberOpen) handleAddMember(memberOpen, c.PK_ChildId); setMemberOpen(null); setMemberSearch(''); }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="font-semibold text-sm">{c.FullName}</span>
                      {inGroup && <span className="text-xs text-muted-foreground">уже в группе</span>}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={!!renameGroup} onOpenChange={(o) => !o && setRenameGroup(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Переименовать группу</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Новое название *</Label>
              <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} maxLength={80} className="rounded-xl h-11" autoFocus />
            </div>
            <Button onClick={handleRename} className="w-full h-11 font-bold rounded-xl">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsPage;
