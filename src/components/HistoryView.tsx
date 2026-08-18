import { useState } from 'react';
import { 
  History, 
  Trash2, 
  Play, 
  Clock, 
  X, 
  Sparkles,
  Clapperboard,
  Film
} from 'lucide-react';
import { WatchHistoryItem, Movie } from '../types';

interface HistoryViewProps {
  history: WatchHistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onExploreMovies: () => void;
}

export function HistoryView({
  history,
  onRemoveItem,
  onClearHistory,
  onPlayMovie,
  onOpenDetails,
  onExploreMovies,
}: HistoryViewProps) {
  const [filter, setFilter] = useState<'all' | 'uncompleted' | 'completed'>('all');

  const filtered = history.filter((item) => {
    if (filter === 'uncompleted') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  return (
    <div id="history-view-page" className="py-6 px-1 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              سجل المشاهدة ومتابعة الأفلام
              <span className="text-sm font-normal text-neutral-400 bg-[#171822] px-2.5 py-0.5 rounded-full border border-white/10">
                {history.length} عمل
              </span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              تابع من حيث توقفت مع حفظ التوقيت التلقائي لأفلام الرعب والأعمال السينمائية
            </p>
          </div>
        </div>

        {/* Action controls */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#13141f] p-1 rounded-xl border border-white/10">
              <button
                id="hist-filter-all"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                الكل ({history.length})
              </button>
              <button
                id="hist-filter-uncompleted"
                onClick={() => setFilter('uncompleted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'uncompleted' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                قيد المشاهدة
              </button>
              <button
                id="hist-filter-completed"
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'completed' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                مكتملة
              </button>
            </div>

            <button
              id="clear-all-history-btn"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 bg-[#171824] hover:bg-red-950/40 border border-white/10 hover:border-red-800/50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="مسح سجل المشاهدة بالكامل"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح السجل بالكامل</span>
            </button>
          </div>
        )}
      </div>

      {/* History Items or Empty state */}
      {history.length === 0 ? (
        <div id="history-empty-state" className="flex flex-col items-center justify-center py-20 text-center bg-[#0e1017]/80 rounded-3xl border border-white/5 p-8 max-w-xl mx-auto shadow-inner">
          <div className="w-20 h-20 rounded-full bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <History className="w-10 h-10 text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">سجل المشاهدة نظيف وفارغ</h3>
          <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
            عندما تشاهد أو تستعرض أي فيلم، سيتم تتبع تقدمك هنا تلقائياً لكي تستأنف المتابعة بسلاسة من الدقيقة التي توقفت عندها.
          </p>
          <button
            id="history-explore-cta"
            onClick={onExploreMovies}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">لا توجد عناصر مطابقة في سجل المشاهدة.</p>
        </div>
      ) : (
        <div id="history-items-list" className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="group relative bg-[#13141f]/90 hover:bg-[#181a28] border border-white/10 hover:border-red-600/40 rounded-2xl p-4 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
            >
              {/* Left Details (Thumbnail + Info) */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Thumbnail with progress bar */}
                <div 
                  onClick={() => onPlayMovie(item.movie)}
                  className="relative w-28 md:w-36 h-20 md:h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 cursor-pointer group-hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                  <img
                    src={item.movie.backdrop || item.movie.poster}
                    alt={item.movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white mr-0.5" />
                    </div>
                  </div>

                  {/* Progress Bar inside Thumbnail bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/80">
                    <div
                      className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,1)]"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Text Info */}
                <div className="min-w-0 flex-1 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                      <Film className="w-2.5 h-2.5" /> سينما
                    </span>

                    <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" /> {item.watchedAt}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onOpenDetails(item.movie)}
                    className="text-sm md:text-base font-bold text-white hover:text-red-400 cursor-pointer truncate transition-colors"
                  >
                    {item.movie.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                    <span>توقف عند: <strong className="text-white font-mono">{item.lastTimestamp}</strong></span>
                    <span>•</span>
                    <span className="text-neutral-300">المدة الكلية: {item.movie.duration}</span>
                  </div>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                <button
                  id={`resume-btn-${item.id}`}
                  onClick={() => onPlayMovie(item.movie)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>متابعة المشاهدة</span>
                </button>

                <button
                  id={`remove-hist-${item.id}`}
                  onClick={() => onRemoveItem(item.id)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-800/40 flex items-center justify-center transition-colors cursor-pointer"
                  title="حذف من السجل"
                  aria-label="حذف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
