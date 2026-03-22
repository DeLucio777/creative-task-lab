import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import type { Task, TaskTemplate } from '@/types/models';
import { Calendar, FileText, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

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

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks);
    api.getTemplates().then(setTemplates);
  }, []);

  // Group tasks by difficulty for bar chart
  const difficultyData = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    tasks.forEach(t => {
      if (t.DifficultyLevel) counts[t.DifficultyLevel]++;
    });
    return [
      { name: '🟢 Лёгкий', count: counts.Easy },
      { name: '🟡 Средний', count: counts.Medium },
      { name: '🔴 Сложный', count: counts.Hard },
    ];
  }, [tasks]);

  // Group tasks by template for pie chart
  const templateData = useMemo(() => {
    return templates.map(tmpl => ({
      name: tmpl.TemplateName,
      value: tasks.filter(t => t.FK_TemplateId === tmpl.PK_TemplateId).length,
    })).filter(d => d.value > 0);
  }, [tasks, templates]);

  const taskCount = tasks.length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">📊 Отчётность</h1>
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
            <p className="text-5xl font-extrabold text-primary">{taskCount}</p>
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
