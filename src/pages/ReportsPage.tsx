import React, { useState, useEffect, useMemo } from 'react';
import { tasksApi } from '@/services/tasksApi';
import { childrenApi, educatorsApi, progressApi, taskListsApi, groupsApi } from '@/services/entitiesApi';
import type { Task, Child, Educator, ProgressRecord, TaskList, TaskListItem, ChildGroup, ChildGroupMember } from '@/types/models';
import { Calendar, Download, FileText, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type Row = (string | number)[];
type ReportData = { title: string; headers: string[]; rows: Row[] };

const inDate = (iso: string | undefined, from: string, to: string) => {
  if (!iso) return !from && !to;
  const d = new Date(iso);
  if (from && d < new Date(from)) return false;
  if (to) { const e = new Date(to); e.setHours(23, 59, 59, 999); if (d > e) return false; }
  return true;
};

const exportXLSX = (data: ReportData) => {
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');
  XLSX.writeFile(wb, `${data.title}.xlsx`);
  toast.success('Экспортировано в Excel');
};

const exportPDF = (data: ReportData) => {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(14);
  doc.text(data.title, 14, 16);
  autoTable(doc, { head: [data.headers], body: data.rows.map(r => r.map(String)), startY: 22, styles: { fontSize: 9 } });
  doc.save(`${data.title}.pdf`);
  toast.success('Экспортировано в PDF');
};

const exportDOCX = async (data: ReportData) => {
  const border = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const margins = { top: 60, bottom: 60, left: 100, right: 100 };
  const headerRow = new TableRow({
    children: data.headers.map(h => new TableCell({
      borders, margins, shading: { fill: 'D5E8F0', type: 'clear' as never },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: 'Arial', size: 20 })] })],
    })),
  });
  const bodyRows = data.rows.map(r => new TableRow({
    children: r.map(c => new TableCell({
      borders, margins,
      children: [new Paragraph({ children: [new TextRun({ text: String(c), font: 'Arial', size: 20 })] })],
    })),
  }));
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.title, bold: true, size: 32, font: 'Arial' })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Сформировано: ${new Date().toLocaleDateString('ru')}`, size: 18, font: 'Arial', color: '888888' })] }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [headerRow, ...bodyRows] }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.title}.docx`);
  toast.success('Экспортировано в Word');
};

const ExportButtons: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="flex flex-wrap gap-2">
    <Button onClick={() => exportPDF(data)} variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
    <Button onClick={() => exportXLSX(data)} variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Excel</Button>
    <Button onClick={() => exportDOCX(data)} variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Word</Button>
  </div>
);

const TablePreview: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="overflow-x-auto rounded-xl border-2 border-border">
    <table className="w-full text-sm">
      <thead className="bg-accent/30">
        <tr>{data.headers.map(h => <th key={h} className="text-left px-3 py-2 font-bold">{h}</th>)}</tr>
      </thead>
      <tbody>
        {data.rows.map((r, i) => (
          <tr key={i} className="border-t border-border">
            {r.map((c, j) => <td key={j} className="px-3 py-2">{String(c)}</td>)}
          </tr>
        ))}
        {data.rows.length === 0 && (
          <tr><td colSpan={data.headers.length} className="px-3 py-6 text-center text-muted-foreground">Нет данных</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const ReportsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [educators, setEducators] = useState<Educator[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [listItems, setListItems] = useState<TaskListItem[]>([]);
  const [groups, setGroups] = useState<ChildGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<ChildGroupMember[]>([]);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [childId, setChildId] = useState<number>(0);
  const [educatorId, setEducatorId] = useState<number>(0);

  useEffect(() => {
    Promise.all([
      tasksApi.getTasks(), childrenApi.getAll(), educatorsApi.getAll(),
      progressApi.getAll(), taskListsApi.getAll(), taskListsApi.getAllItems(),
      groupsApi.getAll(), groupsApi.getAllMembers(),
    ]).then(([t, c, e, p, l, li, g, gm]) => {
      setTasks(t); setChildren(c); setEducators(e); setProgress(p);
      setLists(l); setListItems(li); setGroups(g); setGroupMembers(gm);
    });
  }, []);

  const taskTitle = (id: number) => tasks.find(t => t.PK_TaskId === id)?.Title || `#${id}`;
  const childName = (id: number) => children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;

  /** Возвращает педагогов, связанных с ребёнком через группы. */
  const educatorIdsForChild = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const m of groupMembers) {
      const g = groups.find(x => x.PK_Id === m.FK_group_id);
      if (!g) continue;
      if (!map.has(m.FK_user_id)) map.set(m.FK_user_id, new Set());
      map.get(m.FK_user_id)!.add(g.FK_Teacher_id);
    }
    return map;
  }, [groups, groupMembers]);
  const educatorNamesForChild = (cid: number) => {
    const ids = educatorIdsForChild.get(cid);
    if (!ids || ids.size === 0) return '—';
    return [...ids].map(eid => educators.find(e => e.PK_EducatorId === eid)?.FullName || `#${eid}`).join(', ');
  };

  // 1. Прогресс ребёнка
  const childProgressReport = useMemo<ReportData>(() => ({
    title: childId ? `Прогресс — ${childName(childId)}` : 'Прогресс ребёнка (все дети)',
    headers: ['Дата', 'Ребёнок', 'Результат', 'Ошибок', 'Подсказок', 'Время, сек'],
    rows: progress
      .filter(p => !childId || p.FK_ChildId === childId)
      .filter(p => inDate(p.CompletedDate, dateFrom, dateTo))
      .map(p => [
        new Date(p.CompletedDate).toLocaleDateString('ru'),
        childName(p.FK_ChildId),
        p.IsCorrect ? '✓ верно' : '✗ ошибка',
        p.ErrorCount, p.HintsUsed, p.TimeTakenSeconds || 0,
      ]),
  }), [progress, children, childId, dateFrom, dateTo]);

  // 2. Сводный отчёт по педагогу (через группы)
  const educatorSummaryReport = useMemo<ReportData>(() => {
    const edu = educators.find(e => e.PK_EducatorId === educatorId);
    const myChildren = children.filter(c => {
      if (!educatorId) return true;
      return educatorIdsForChild.get(c.PK_ChildId)?.has(educatorId);
    });
    const rows: Row[] = myChildren.map(c => {
      const ps = progress.filter(p => p.FK_ChildId === c.PK_ChildId && inDate(p.CompletedDate, dateFrom, dateTo));
      const correct = ps.filter(p => p.IsCorrect).length;
      const errors = ps.reduce((s, p) => s + p.ErrorCount, 0);
      const hints = ps.reduce((s, p) => s + p.HintsUsed, 0);
      const successRate = ps.length ? `${Math.round((correct / ps.length) * 100)}%` : '—';
      return [c.FullName, educatorNamesForChild(c.PK_ChildId), ps.length, correct, errors, hints, successRate];
    });
    return {
      title: edu ? `Сводный отчёт — ${edu.FullName}` : 'Сводный отчёт по педагогам',
      headers: ['Ребёнок', 'Педагоги', 'Всего попыток', 'Верных', 'Ошибок', 'Подсказок', 'Успех'],
      rows,
    };
  }, [educators, children, progress, educatorId, dateFrom, dateTo, educatorIdsForChild]);

  // 3. Список детей
  const registrationsReport = useMemo<ReportData>(() => {
    const rows: Row[] = children.map(c => [
      c.FullName,
      c.age ?? '—',
      c.speak_level || '—',
      c.email || '—',
      educatorNamesForChild(c.PK_ChildId),
    ]);
    rows.push(['ИТОГО', String(children.length), '', '', '']);
    return {
      title: 'Сведения о детях',
      headers: ['ФИО ребёнка', 'Возраст', 'Уровень речи', 'Email', 'Педагоги'],
      rows,
    };
  }, [children, educators, educatorIdsForChild]);

  // 4. История прохождения цепочек
  const learningHistoryReport = useMemo<ReportData>(() => {
    const c = children.find(x => x.PK_ChildId === childId);
    const items = listItems.filter(i => (!childId || i.user_id === childId));
    return {
      title: c ? `История цепочек — ${c.FullName}` : 'История цепочек',
      headers: ['Ребёнок', 'Цепочка', 'Задание', 'Позиция', 'Статус'],
      rows: items.map(i => {
        const l = lists.find(x => x.PK_id === i.task_list_id);
        return [
          childName(i.user_id),
          l?.Title || `#${i.task_list_id}`,
          taskTitle(i.task_id),
          i.position,
          i.complited ? '✓ выполнено' : '⏳ в работе',
        ];
      }),
    };
  }, [lists, listItems, children, childId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">📊 Отчётность</h1>

      <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-4">
        <p className="font-bold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Фильтры</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">С</Label>
            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="pl-9 rounded-xl h-10" /></div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">По</Label>
            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="pl-9 rounded-xl h-10" /></div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ребёнок</Label>
            <select value={childId} onChange={e => setChildId(Number(e.target.value))} className="w-full text-sm rounded-xl border-2 border-border bg-card p-2 h-10 font-medium">
              <option value={0}>Все дети</option>
              {children.map(c => <option key={c.PK_ChildId} value={c.PK_ChildId}>{c.FullName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Педагог</Label>
            <select value={educatorId} onChange={e => setEducatorId(Number(e.target.value))} className="w-full text-sm rounded-xl border-2 border-border bg-card p-2 h-10 font-medium">
              <option value={0}>Все педагоги</option>
              {educators.map(e => <option key={e.PK_EducatorId} value={e.PK_EducatorId}>{e.FullName}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="child-progress">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="child-progress">Прогресс ребёнка</TabsTrigger>
          <TabsTrigger value="educator">По педагогу</TabsTrigger>
          <TabsTrigger value="registrations">Список детей</TabsTrigger>
          <TabsTrigger value="history">История цепочек</TabsTrigger>
        </TabsList>

        {[childProgressReport, educatorSummaryReport, registrationsReport, learningHistoryReport].map((rep, i) => (
          <TabsContent key={i} value={['child-progress', 'educator', 'registrations', 'history'][i]} className="space-y-4 mt-4">
            <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="font-bold">{rep.title}</p></div>
                <ExportButtons data={rep} />
              </div>
              <TablePreview data={rep} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
