import React, { useState, useEffect, useMemo } from 'react';
import { tasksApi } from '@/services/tasksApi';
import { childrenApi, educatorsApi, progressApi, assignmentsApi, taskListsApi } from '@/services/entitiesApi';
import type { Task, Child, Educator, ProgressRecord, TaskAssignment, TaskList } from '@/types/models';
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
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [childId, setChildId] = useState<number>(0);
  const [educatorId, setEducatorId] = useState<number>(0);

  useEffect(() => {
    Promise.all([tasksApi.getTasks(), childrenApi.getAll(), educatorsApi.getAll(), progressApi.getAll(), assignmentsApi.getAll(), taskListsApi.getAll()])
      .then(([t, c, e, p, a, l]) => { setTasks(t); setChildren(c); setEducators(e); setProgress(p); setAssignments(a); setLists(l); });
  }, []);

  const taskTitle = (id: number) => tasks.find(t => t.PK_TaskId === id)?.Title || `#${id}`;
  const childName = (id: number) => children.find(c => c.PK_ChildId === id)?.FullName || `#${id}`;

  // 1. Прогресс ребёнка
  const childProgressReport = useMemo<ReportData>(() => ({
    title: childId ? `Прогресс — ${childName(childId)}` : 'Прогресс ребёнка (все дети)',
    headers: ['Дата', 'Ребёнок', 'Задание', 'Результат', 'Ошибок', 'Подсказок', 'Время, сек'],
    rows: progress
      .filter(p => !childId || p.FK_ChildId === childId)
      .filter(p => inDate(p.CompletedDate, dateFrom, dateTo))
      .map(p => {
        const a = assignments.find(x => x.PK_AssignmentId === p.FK_AssignmentId);
        return [
          new Date(p.CompletedDate).toLocaleDateString('ru'),
          childName(p.FK_ChildId),
          a ? taskTitle(a.FK_TaskId) : '—',
          p.IsCorrect ? '✓ верно' : '✗ ошибка',
          p.ErrorCount, p.HintsUsed, p.TimeTakenSeconds || 0,
        ];
      }),
  }), [progress, assignments, tasks, children, childId, dateFrom, dateTo]);

  // 2. Сводный отчёт по педагогу
  const educatorSummaryReport = useMemo<ReportData>(() => {
    const edu = educators.find(e => e.PK_EducatorId === educatorId);
    const myChildren = children.filter(c => !educatorId || c.FK_EducatorId === educatorId);
    const rows: Row[] = myChildren.map(c => {
      const ps = progress.filter(p => p.FK_ChildId === c.PK_ChildId && inDate(p.CompletedDate, dateFrom, dateTo));
      const correct = ps.filter(p => p.IsCorrect).length;
      const errors = ps.reduce((s, p) => s + p.ErrorCount, 0);
      const hints = ps.reduce((s, p) => s + p.HintsUsed, 0);
      const eduName = educators.find(e => e.PK_EducatorId === c.FK_EducatorId)?.FullName || '—';
      const successRate = ps.length ? `${Math.round((correct / ps.length) * 100)}%` : '—';
      return [c.FullName, eduName, ps.length, correct, errors, hints, successRate];
    });
    return {
      title: edu ? `Сводный отчёт — ${edu.FullName}` : 'Сводный отчёт по педагогам',
      headers: ['Ребёнок', 'Педагог', 'Всего попыток', 'Верных', 'Ошибок', 'Подсказок', 'Успех'],
      rows,
    };
  }, [educators, children, progress, educatorId, dateFrom, dateTo]);

  // 3. Регистрации детей за период
  const registrationsReport = useMemo<ReportData>(() => {
    const filtered = children.filter(c => inDate(c.RegisteredDate, dateFrom, dateTo));
    const rows: Row[] = filtered.map(c => [
      c.RegisteredDate ? new Date(c.RegisteredDate).toLocaleDateString('ru') : '—',
      c.FullName,
      c.BirthDate ? new Date(c.BirthDate).toLocaleDateString('ru') : '—',
      c.SpeechLevel || '—',
      educators.find(e => e.PK_EducatorId === c.FK_EducatorId)?.FullName || '—',
    ]);
    rows.push(['ИТОГО', String(filtered.length), '', '', '']);
    return {
      title: 'Сведения о регистрации детей за период',
      headers: ['Дата регистрации', 'ФИО ребёнка', 'Дата рождения', 'Уровень речи', 'Педагог'],
      rows,
    };
  }, [children, educators, dateFrom, dateTo]);

  // 4. История обучения ребёнка
  const learningHistoryReport = useMemo<ReportData>(() => {
    const c = children.find(x => x.PK_ChildId === childId);
    const cps = progress.filter(p => (!childId || p.FK_ChildId === childId) && inDate(p.CompletedDate, dateFrom, dateTo))
      .sort((a, b) => new Date(a.CompletedDate).getTime() - new Date(b.CompletedDate).getTime());
    return {
      title: c ? `История обучения — ${c.FullName}` : 'История обучения детей',
      headers: ['Дата и время', 'Ребёнок', 'Задание', 'Результат', 'Подсказок', 'Ошибок', 'Время, сек'],
      rows: cps.map(p => {
        const a = assignments.find(x => x.PK_AssignmentId === p.FK_AssignmentId);
        return [
          new Date(p.CompletedDate).toLocaleString('ru'),
          childName(p.FK_ChildId),
          a ? taskTitle(a.FK_TaskId) : '—',
          p.IsCorrect ? '✓ верно' : '✗ ошибка',
          p.HintsUsed,
          p.ErrorCount,
          p.TimeTakenSeconds || 0,
        ];
      }),
    };
  }, [progress, assignments, tasks, children, childId, dateFrom, dateTo]);

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
          <TabsTrigger value="registrations">Регистрации</TabsTrigger>
          <TabsTrigger value="history">История обучения</TabsTrigger>
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
