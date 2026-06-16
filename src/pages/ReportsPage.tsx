import React, { useState, useEffect, useMemo } from 'react';
import { tasksApi } from '@/services/tasksApi';
import {
  childrenApi,
  educatorsApi,
  progressApi,
  taskListsApi,
  groupsApi,
  achievementsApi,
  diseasesApi
} from '@/services/entitiesApi';
import type {
  Task, Child, Educator, ProgressRecord, TaskList, TaskListItem, ChildGroup, ChildGroupMember, Disease,
  Achievement,
  UserAchievement
} from '@/types/models';
import { Download, FileText, BarChart3 } from 'lucide-react';
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [childId, setChildId] = useState<number>(0);
  const [educatorId, setEducatorId] = useState<number>(0);

  useEffect(() => {
    Promise.all([
      tasksApi.getTasks(),
      childrenApi.getAll(),
      educatorsApi.getAll(),
      progressApi.getAll(),
      taskListsApi.getAll(),
      taskListsApi.getAllItems(),
      groupsApi.getAll(),
      groupsApi.getAllMembers(),
      achievementsApi.getAll(),
      achievementsApi.getAllUserAchievements(),
      diseasesApi.getAll(),
    ]).then(([t, c, e, p, l, li, g, gm, a, ua, d]) => {
      setTasks(t); setChildren(c); setEducators(e); setProgress(p);
      setLists(l); setListItems(li); setGroups(g); setGroupMembers(gm);
      setAchievements(a);
      setUserAchievements(ua);
      setDiseases(d);
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

  // УНИКАЛИЗАЦИЯ ВСЕХ ДАННЫХ ОДНИМ БЛОКОМ
  const progressUnique = [
    ...new Map(progress.map(p => [p.user_id, p])).values()
  ];

  const listItemsUnique = [
    ...new Map(listItems.map(i => [`${i.user_id}_${i.task_id}`, i])).values()
  ];

  const childrenUnique = [
    ...new Map(children.map(c => [c.PK_ChildId, c])).values()
  ];

  const historyUnique = [
    ...new Map(listItems.map(i => [`${i.task_list_id}_${i.task_id}_${i.user_id}`, i])).values()
  ];


// 1. Отчёт по прогрессу детей
  const childProgressReport = useMemo<ReportData>(() => ({
    title: 'Отчёт по прогрессу детей',

    headers: [
      'Ребёнок',
      'Возраст',
      'Уровень речи',
      'Диагноз',
      'Выполнено',
      'Пропущено',
      'Подсказок',
      'Достижения'
    ],

    rows: childrenUnique.map(child => {

      const childProgress =
          progressUnique.filter(
              p => p.user_id === child.PK_ChildId
          );

      const completed =
          childProgress.filter(
              p => p.completed
          ).length;

      const missed =
          childProgress.filter(
              p => !p.completed
          ).length;

      const hints =
          childProgress.reduce(
              (s, p) => s + (p.helps_used_count ?? 0),
              0
          );

      const disease =
          diseases.find(
              d => d.PK_Id === child.FK_disease_id
          )?.name ?? '—';

      const achNames =
          userAchievements
              .filter(
                  ua => ua.user_id === child.PK_ChildId
              )
              .map(
                  ua =>
                      achievements.find(
                          a => a.id === ua.achivement_id
                      )?.name
              )
              .filter(Boolean)
              .join(', ') || '—';

      return [
        child.FullName,
        child.age ?? '—',
        child.speak_level ?? '—',
        disease,
        completed,
        missed,
        hints,
        achNames
      ];
    }),
  }), [
    childrenUnique,
    progressUnique,
    diseases,
    achievements,
    userAchievements
  ]);


// 2. Сводный отчёт по педагогам
  const educatorSummaryReport = useMemo<ReportData>(() => ({
    title: 'Сводный отчёт педагогов',

    headers: [
      'Педагог',
      'Группа',
      'Детей',
      'Назначено (заданий)',
      'Выполнено (заданий)',
      'Прогресс %'
    ],

    rows: groups.map(group => {

      const teacher =
          educators.find(
              e => e.PK_EducatorId === group.FK_Teacher_id
          );

      const members =
          groupMembers.filter(
              m => m.FK_group_id === group.PK_Id
          );

      const childIds =
          members.map(
              m => m.FK_user_id
          );

      const assigned =
          listItemsUnique.filter(
              i => childIds.includes(i.user_id)
          ).length;

      const completed =
          listItemsUnique.filter(
              i =>
                  childIds.includes(i.user_id) &&
                  i.complited
          ).length;

      const percent =
          assigned > 0
              ? Math.round(completed / assigned * 100)
              : 0;

      return [
        teacher?.FullName ?? '—',
        group.GroupName ?? `Группа ${group.PK_Id}`,
        childIds.length,
        assigned,
        completed,
        `${percent}%`
      ];
    }),
  }), [
    groups,
    groupMembers,
    educators,
    listItemsUnique
  ]);


// 3. Статистика детей
  const registrationsReport = useMemo<ReportData>(() => {

    const totalChildren = childrenUnique.length;

    const ageGroups = [
      {
        title: 'До 7 лет',
        count: childrenUnique.filter(
            c => (c.age ?? 0) < 7
        ).length
      },
      {
        title: '7-12 лет',
        count: childrenUnique.filter(
            c => (c.age ?? 0) >= 7 &&
                (c.age ?? 0) <= 12
        ).length
      },
      {
        title: 'Старше 12 лет',
        count: childrenUnique.filter(
            c => (c.age ?? 0) > 12
        ).length
      }
    ];

    return {
      title: 'Статистика зарегистрированных детей',

      headers: [
        'Показатель',
        'Значение'
      ],

      rows: [
        [
          'Всего зарегистрировано детей',
          totalChildren
        ],

        ...ageGroups.map(g => [
          g.title,
          g.count
        ]),

        [
          'Средний возраст',
          totalChildren
              ? (
                  childrenUnique.reduce(
                      (s, c) => s + (c.age ?? 0),
                      0
                  ) / totalChildren
              ).toFixed(1)
              : '0'
        ]
      ]
    };

  }, [childrenUnique]);


// 4. История обучения
  const learningHistoryReport = useMemo<ReportData>(() => ({

    title: childId
        ? `История обучения — ${childName(childId)}`
        : 'История обучения детей',

    headers: [
      'Ребёнок',
      'Цепочка',
      'Задание',
      'Тип',
      'Позиция',
      'Статус'
    ],

    rows: historyUnique
        .filter(
            item =>
                !childId ||
                item.user_id === childId
        )
        .map(item => {

          const task =
              tasks.find(
                  t => t.PK_TaskId === item.task_id
              );

          const taskList =
              lists.find(
                  l => l.PK_id === item.task_list_id
              );

          return [
            childName(item.user_id),

            taskList?.Title ??
            `Цепочка ${item.task_list_id}`,

            task?.Title ?? '—',

            task?.Template?.TemplateName ?? '—',

            item.position,

            item.complited
                ? 'Выполнено'
                : 'Не выполнено'
          ];
        })

  }), [
    childId,
    historyUnique,
    tasks,
    lists,
    childrenUnique
  ]);

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
