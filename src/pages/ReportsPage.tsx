import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import type { Task, TaskTemplate } from '@/types/models';
import { Calendar, FileText, TrendingUp, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
];

const chartConfig: ChartConfig = {
  count: { label: 'Заданий', color: 'hsl(var(--primary))' },
};

const templateChartConfig: ChartConfig = {
  value: { label: 'Заданий' },
};

const difficultyLabel = (d?: string) => {
  if (d === 'Easy') return 'Лёгкий';
  if (d === 'Medium') return 'Средний';
  if (d === 'Hard') return 'Сложный';
  return 'Не указан';
};

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks);
    api.getTemplates().then(setTemplates);
  }, []);

  // Filter tasks by date range
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.CreatedDate) return !dateFrom && !dateTo;
      const created = new Date(t.CreatedDate);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    });
  }, [tasks, dateFrom, dateTo]);

  // Group filtered tasks by difficulty for bar chart
  const difficultyData = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    filteredTasks.forEach(t => {
      if (t.DifficultyLevel) counts[t.DifficultyLevel]++;
    });
    return [
      { name: '🟢 Лёгкий', count: counts.Easy },
      { name: '🟡 Средний', count: counts.Medium },
      { name: '🔴 Сложный', count: counts.Hard },
    ];
  }, [filteredTasks]);

  // Group filtered tasks by template for pie chart
  const templateData = useMemo(() => {
    return templates.map(tmpl => ({
      name: tmpl.TemplateName,
      value: filteredTasks.filter(t => t.FK_TemplateId === tmpl.PK_TemplateId).length,
    })).filter(d => d.value > 0);
  }, [filteredTasks, templates]);

  const getTemplateName = (id: number) =>
    templates.find(t => t.PK_TemplateId === id)?.TemplateName || `Шаблон #${id}`;

  const handleExportDocx = async () => {
    const periodText = dateFrom && dateTo
      ? `с ${new Date(dateFrom).toLocaleDateString('ru')} по ${new Date(dateTo).toLocaleDateString('ru')}`
      : 'За всё время';

    const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
    const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
    const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

    // Summary table rows
    const summaryRows = [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, margins: cellMargins,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: 'D5E8F0', type: 'clear' as any },
            children: [new Paragraph({ children: [new TextRun({ text: 'Показатель', bold: true, font: 'Arial', size: 22 })] })],
          }),
          new TableCell({
            borders: cellBorders, margins: cellMargins,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: 'D5E8F0', type: 'clear' as any },
            children: [new Paragraph({ children: [new TextRun({ text: 'Значение', bold: true, font: 'Arial', size: 22 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Всего заданий', font: 'Arial', size: 22 })] })] }),
          new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(filteredTasks.length), font: 'Arial', size: 22, bold: true })] })] }),
        ],
      }),
      ...difficultyData.map(d =>
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: d.name.replace(/[🟢🟡🔴]\s?/, ''), font: 'Arial', size: 22 })] })] }),
            new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(d.count), font: 'Arial', size: 22 })] })] }),
          ],
        })
      ),
      ...templateData.map(d =>
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: `Шаблон: ${d.name}`, font: 'Arial', size: 22 })] })] }),
            new TableCell({ borders: cellBorders, margins: cellMargins, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(d.value), font: 'Arial', size: 22 })] })] }),
          ],
        })
      ),
    ];

    // Task detail table
    const taskDetailRows = [
      new TableRow({
        children: ['#', 'Название', 'Сложность', 'Шаблон', 'Дата создания'].map(header =>
          new TableCell({
            borders: cellBorders, margins: cellMargins,
            width: { size: Math.floor(9360 / 5), type: WidthType.DXA },
            shading: { fill: 'D5E8F0', type: 'clear' as any },
            children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, font: 'Arial', size: 20 })] })],
          })
        ),
      }),
      ...filteredTasks.map((task, idx) =>
        new TableRow({
          children: [
            String(idx + 1),
            task.Title,
            difficultyLabel(task.DifficultyLevel),
            getTemplateName(task.FK_TemplateId),
            task.CreatedDate ? new Date(task.CreatedDate).toLocaleDateString('ru') : '—',
          ].map(text =>
            new TableCell({
              borders: cellBorders, margins: cellMargins,
              width: { size: Math.floor(9360 / 5), type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text, font: 'Arial', size: 20 })] })],
            })
          ),
        })
      ),
    ];

    const doc = new Document({
      styles: {
        default: { document: { run: { font: 'Arial', size: 24 } } },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'Отчёт по заданиям', bold: true, size: 36, font: 'Arial' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `Период: ${periodText}`, size: 24, font: 'Arial', color: '666666' })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
            children: [new TextRun({ text: 'Сводка', bold: true, size: 28, font: 'Arial' })],
          }),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [4680, 4680],
            rows: summaryRows,
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: 'Список заданий', bold: true, size: 28, font: 'Arial' })],
          }),
          ...(filteredTasks.length > 0
            ? [new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: Array(5).fill(Math.floor(9360 / 5)),
                rows: taskDetailRows,
              })]
            : [new Paragraph({ children: [new TextRun({ text: 'Нет заданий за выбранный период.', italics: true, font: 'Arial', size: 22 })] })]
          ),
          new Paragraph({
            spacing: { before: 600 },
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `Дата формирования: ${new Date().toLocaleDateString('ru')}`, size: 20, font: 'Arial', color: '999999' })],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `report_${dateFrom || 'all'}_${dateTo || 'all'}.docx`);
    toast.success('Отчёт экспортирован в DOCX');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">📊 Отчётность</h1>
        <Button onClick={handleExportDocx} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Экспорт в DOCX
        </Button>
      </div>
      <div className="space-y-6">
        {/* Total tasks card */}
        <div className="bg-card rounded-2xl border-2 border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Созданные задания</h3>
              <p className="text-xs text-muted-foreground font-medium">Количество заданий за выбранный период</p>
            </div>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <Label className="font-semibold text-xs">Дата начала</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="pl-9 rounded-xl h-11" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="font-semibold text-xs">Дата окончания</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="pl-9 rounded-xl h-11" />
              </div>
            </div>
          </div>
          <div className="bg-accent/50 rounded-xl p-6 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Всего заданий</p>
            <p className="text-5xl font-extrabold text-primary">{filteredTasks.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-2">
              {dateFrom && dateTo
                ? `с ${new Date(dateFrom).toLocaleDateString('ru')} по ${new Date(dateTo).toLocaleDateString('ru')}`
                : 'За всё время'}
            </p>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart - by difficulty */}
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">По сложности</h3>
                <p className="text-xs text-muted-foreground font-medium">Распределение заданий по уровню</p>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Pie chart - by template */}
          <div className="bg-card rounded-2xl border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">По типу задания</h3>
                <p className="text-xs text-muted-foreground font-medium">Распределение по шаблонам</p>
              </div>
            </div>
            <ChartContainer config={templateChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={templateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {templateData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {templateData.length === 0 && (
              <p className="text-center text-muted-foreground text-sm font-medium">Нет данных</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
