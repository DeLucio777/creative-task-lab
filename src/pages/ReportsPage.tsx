import React, { useState, useMemo } from 'react';
import { MOCK_TASKS } from '@/data/mockData';
import { Calendar, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const taskCount = useMemo(() => {
    // In a real app this would query the DB; for now count mock tasks
    return MOCK_TASKS.length;
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">📊 Отчётность</h1>

      <div className="space-y-4">
        {/* Report card */}
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
      </div>
    </div>
  );
};

export default ReportsPage;
