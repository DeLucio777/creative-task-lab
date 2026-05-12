import React, { useEffect, useState } from 'react';
import { mediaApi } from '@/services/mediaApi';
import type { CatalogPECS, MediaCatalog } from '@/types/models';

type TaskType = 'find_odd' | 'match_image_word' | 'sequence' | 'sort';

interface FindOddItem { id: string; text: string; isOdd: boolean; pecsId?: number; }
interface MatchPair { id: string; mediaId?: number; pecsId?: number; word: string; }
interface SeqItem { id: string; order: number; value: string; pecsId?: number; }
interface SortItemData { id: string; value: string; sortKey: string; pecsId?: number; }

interface TaskPreviewProps {
  taskType: TaskType;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  showHints: boolean;
  oddItems?: FindOddItem[];
  matchPairs?: MatchPair[];
  seqItems?: SeqItem[];
  sortItems?: SortItemData[];
}

const diffColors = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

const PecsImage: React.FC<{ pecsId?: number; size?: string; pecsList: CatalogPECS[] }> = ({ pecsId, size = 'w-12 h-12', pecsList }) => {
  const pecs = pecsId ? pecsList.find(p => p.PK_PECSid === pecsId) : null;
  if (!pecs) return <div className={`${size} bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs`}>?</div>;
  return <img src={pecs.filePath} alt={pecs.Descripti} className={`${size} object-contain rounded-xl border border-border bg-card p-1`} />;
};

const TaskPreview: React.FC<TaskPreviewProps> = ({
  taskType, title, difficulty, showHints,
  oddItems = [], matchPairs = [], seqItems = [], sortItems = [],
}) => {
  const [pecsList, setPecsList] = useState<CatalogPECS[]>([]);
  const [mediaList, setMediaList] = useState<MediaCatalog[]>([]);
  useEffect(() => {
    mediaApi.getPecs().then(setPecsList);
    mediaApi.getMedia().then(setMediaList);
  }, []);
  const typeLabels: Record<TaskType, string> = {
    find_odd: '🔍 Найди лишнее',
    match_image_word: '🖼️ Сопоставь',
    sequence: '🔢 Последовательность',
    sort: '📂 Сортировка',
  };

  const renderFindOdd = () => {
    const items = oddItems.filter(i => i.text || i.pecsId);
    if (!items.length) return <p className="text-xs text-muted-foreground italic">Добавьте элементы...</p>;
    return (
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => (
          <div key={item.id} className={`p-2 rounded-xl border-2 text-center transition-all ${
            showHints && item.isOdd ? 'border-red-300 bg-red-50' : 'border-border bg-card'
          }`}>
            <PecsImage pecsId={item.pecsId} size="w-10 h-10 mx-auto" />
            <p className="text-xs font-bold mt-1 truncate">{item.text || '—'}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderMatch = () => {
    const pairs = matchPairs.filter(p => p.word || p.pecsId);
    if (!pairs.length) return <p className="text-xs text-muted-foreground italic">Добавьте пары...</p>;
    return (
      <div className="space-y-2">
        {pairs.map(pair => {
          const media = pair.mediaId ? MOCK_MEDIA.find(m => m.PK_MediaId === pair.mediaId) : null;
          return (
            <div key={pair.id} className="flex items-center gap-3 p-2 rounded-xl border border-border bg-card">
              <PecsImage pecsId={pair.pecsId} size="w-8 h-8" />
              {media && <img src={media.FilePath} alt="" className="w-8 h-8 object-contain rounded-lg border border-border" />}
              <span className="text-xs font-bold flex-1">{showHints ? pair.word : '???'}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSequence = () => {
    const items = seqItems.filter(i => i.value || i.pecsId);
    if (!items.length) return <p className="text-xs text-muted-foreground italic">Добавьте элементы...</p>;
    return (
      <div className="flex gap-2 flex-wrap">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-1">
            <div className="p-2 rounded-xl border border-border bg-card text-center min-w-[48px]">
              <PecsImage pecsId={item.pecsId} size="w-8 h-8 mx-auto" />
              <p className="text-xs font-bold mt-1">{showHints ? item.value : '?'}</p>
            </div>
            {idx < items.length - 1 && <span className="text-muted-foreground font-bold">→</span>}
          </div>
        ))}
      </div>
    );
  };

  const renderSort = () => {
    const items = sortItems.filter(i => i.value || i.pecsId);
    if (!items.length) return <p className="text-xs text-muted-foreground italic">Добавьте элементы...</p>;
    const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
      const key = item.sortKey || 'Без категории';
      (acc[key] = acc[key] || []).push(item);
      return acc;
    }, {});
    return (
      <div className="space-y-2">
        {Object.entries(groups).map(([key, groupItems]) => (
          <div key={key} className="p-2 rounded-xl border border-border bg-card">
            <p className="text-xs font-bold text-primary mb-1">{showHints ? key : '???'}</p>
            <div className="flex gap-1 flex-wrap">
              {groupItems.map(item => (
                <div key={item.id} className="px-2 py-1 rounded-lg bg-muted/50 text-xs font-medium flex items-center gap-1">
                  <PecsImage pecsId={item.pecsId} size="w-6 h-6" />
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (taskType) {
      case 'find_odd': return renderFindOdd();
      case 'match_image_word': return renderMatch();
      case 'sequence': return renderSequence();
      case 'sort': return renderSort();
    }
  };

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">👁️ Предпросмотр</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${diffColors[difficulty]}`}>
          {difficulty === 'Easy' ? 'Лёгкий' : difficulty === 'Medium' ? 'Средний' : 'Сложный'}
        </span>
      </div>

      <div className="bg-muted/20 rounded-2xl border border-border p-4 min-h-[200px]">
        <div className="text-center mb-3">
          <p className="text-xs text-muted-foreground font-medium">{typeLabels[taskType]}</p>
          <h4 className="text-sm font-bold text-foreground">{title || 'Без названия'}</h4>
        </div>
        {renderContent()}
      </div>

      {showHints && (
        <p className="text-xs text-muted-foreground text-center italic">
          💡 Подсказки включены
        </p>
      )}
    </div>
  );
};

export default TaskPreview;
