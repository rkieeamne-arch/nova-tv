import { useRef } from 'react';
import { ChevronRight, ChevronLeft, Clapperboard, Sparkles, Film } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: 'horror' | 'general' | 'trending' | 'original';
  movies: Movie[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  layoutStyle?: 'poster' | 'backdrop' | 'compact';
}

export function MovieSection({
  id,
  title,
  subtitle,
  icon = 'general',
  movies,
  isFavorite,
  onToggleFavorite,
  onPlayMovie,
  onOpenDetails,
  layoutStyle = 'poster',
  isGrid = false,
}: MovieSectionProps & { isGrid?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getGridClasses = () => {
    if (layoutStyle === 'backdrop') {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    }
    if (layoutStyle === 'compact') {
      return "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5 sm:gap-3";
    }
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4";
  };

  if (movies.length === 0) return null;

  return (
    <section id={id} className="mb-10 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          {icon === 'horror' && (
            <div className="w-8 h-8 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary shadow-[0_0_15px_var(--color-glow)]">
              <Clapperboard className="w-4 h-4" />
            </div>
          )}
          {icon === 'general' && (
            <div className="w-8 h-8 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary shadow-[0_0_15px_var(--color-glow)]">
              <Film className="w-4 h-4" />
            </div>
          )}
          {icon === 'original' && (
            <div className="w-8 h-8 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary shadow-[0_0_15px_var(--color-glow)]">
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2 tracking-wide">
              {title}
              <span className="text-xs text-neutral-400 font-mono font-normal">({movies.length})</span>
            </h2>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Carousel Scroll Arrows (Only if NOT grid) */}
        {!isGrid && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              id={`scroll-right-${id}`}
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-xl bg-[#141622] hover:bg-[var(--color-primary)] border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              aria-label="تمرير لليمين"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id={`scroll-left-${id}`}
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-xl bg-[#141622] hover:bg-[var(--color-primary)] border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              aria-label="تمرير لليسار"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Movies Container (Grid or Horizontal Carousel) */}
      <div
        ref={scrollRef}
        className={
          isGrid
            ? getGridClasses()
            : "flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth"
        }
      >
        {movies
          .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
          .map((movie, idx) => (
            <div key={`ms-${movie.id}-${idx}`} className={isGrid ? "flex justify-center w-full" : ""}>
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={isFavorite(movie.id)}
                onToggleFavorite={onToggleFavorite}
                onPlay={onPlayMovie}
                onOpenDetails={onOpenDetails}
                layoutStyle={layoutStyle}
              />
            </div>
          ))}
      </div>
    </section>
  );
}
