import { useState } from 'react';
import { Heart, Trash2, Clapperboard, Film, Sparkles } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface FavoritesViewProps {
  favorites: Movie[];
  onToggleFavorite: (movie: Movie) => void;
  onClearFavorites: () => void;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onExploreMovies: () => void;
  layoutStyle?: 'poster' | 'backdrop' | 'compact';
}

export function FavoritesView({
  favorites,
  onToggleFavorite,
  onClearFavorites,
  onPlayMovie,
  onOpenDetails,
  onExploreMovies,
  layoutStyle = 'poster',
}: FavoritesViewProps) {
  const filtered = favorites;

  const getGridClasses = () => {
    if (layoutStyle === 'backdrop') {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    }
    if (layoutStyle === 'compact') {
      return "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5 sm:gap-3";
    }
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";
  };

  return (
    <div id="favorites-view-page" className="py-6 px-1 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              قائمة أفلامي المفضلة
              <span className="text-sm font-normal text-neutral-400 bg-[#171822] px-2.5 py-0.5 rounded-full border border-white/10">
                {favorites.length} فيلم
              </span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              مجموعتك السينمائية المختارة للوصول السريع إليها في أي وقت على هاتفك أو حاسوبك
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {favorites.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="clear-all-favs-btn"
              onClick={onClearFavorites}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 bg-[#171824] hover:bg-rose-950/40 border border-white/10 hover:border-rose-800/50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="إفراغ قائمة المفضلة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ القائمة</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {favorites.length === 0 ? (
        <div id="favorites-empty-state" className="flex flex-col items-center justify-center py-20 text-center bg-[#0e1017]/80 rounded-3xl border border-white/5 p-8 max-w-xl mx-auto shadow-inner">
          <div className="w-20 h-20 rounded-full theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary mb-4 shadow-[0_0_30px_var(--color-glow)]">
            <Heart className="w-10 h-10 text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">قائمة المفضلة فارغة حالياً</h3>
          <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
            لم تقم بإضافة أي أفلام بعد. اضغط على زر القلب في أي فيلم لإضافته إلى قائمتك الخاصة!
          </p>
          <button
            id="fav-explore-cta"
            onClick={onExploreMovies}
            className="flex items-center gap-2 theme-btn-gradient text-white text-sm font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">لا توجد عناصر في هذا التصنيف داخل المفضلة.</p>
        </div>
      ) : (
        <div id="favorites-grid" className={getGridClasses()}>
          {filtered
            .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
            .map((movie, idx) => (
              <div key={`fav-${movie.id}-${idx}`} className="flex justify-center w-full">
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onPlay={onPlayMovie}
                  onOpenDetails={onOpenDetails}
                  layoutStyle={layoutStyle}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
