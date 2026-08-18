import { useState, useEffect } from 'react';
import { 
  Play, 
  Heart, 
  Star, 
  Clapperboard, 
  Film 
} from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  key?: string;
  movie: Movie;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  layoutStyle?: 'poster' | 'backdrop' | 'compact';
}

const CINEMATIC_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500462818027-0a23f5386830?auto=format&fit=crop&w=600&q=80',
];

function getFallbackPoster(title: string = ''): string {
  const clean = (title || '').trim();
  if (!clean) return CINEMATIC_POSTERS[0];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return CINEMATIC_POSTERS[Math.abs(hash) % CINEMATIC_POSTERS.length];
}

export function MovieCard({
  movie,
  isFavorite,
  onToggleFavorite,
  onPlay,
  onOpenDetails,
  layoutStyle = 'poster',
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const targetImg = layoutStyle === 'backdrop' ? (movie.backdrop || movie.poster) : movie.poster;
  const [imgSrc, setImgSrc] = useState(targetImg);

  useEffect(() => {
    const freshImg = layoutStyle === 'backdrop' ? (movie.backdrop || movie.poster) : movie.poster;
    setImgSrc(freshImg || getFallbackPoster(movie.title || movie.id));
  }, [movie.id, movie.poster, movie.backdrop, layoutStyle]);

  const handleImageError = () => {
    setImgSrc(getFallbackPoster(movie.title || movie.id));
  };

  const getWidth = () => {
    if (layoutStyle === 'backdrop') return '320px';
    if (layoutStyle === 'compact') return '140px';
    return '180px';
  };

  const getAspectRatio = () => {
    if (layoutStyle === 'backdrop') return '16/9';
    if (layoutStyle === 'compact') return '3/4';
    return '2/3';
  };

  return (
    <div
      id={`movie-card-${movie.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex-shrink-0 cursor-pointer text-right w-full flex justify-center transition-all duration-300"
      style={{ maxWidth: getWidth() }}
    >
      {/* Outer Card Container */}
      <div 
        onClick={() => onOpenDetails(movie)}
        className={`w-full relative overflow-hidden rounded-2xl border border-white/10 bg-[#12131a] shadow-lg transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:border-[var(--color-primary)] group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_25px_var(--color-glow)]`}
        style={{ aspectRatio: getAspectRatio() }}
      >
        {/* Poster / Backdrop Image */}
        <img
          src={imgSrc}
          alt={movie.title}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Ambient Hover Shimmer Light */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1 bg-black/75 border border-white/15 text-neutral-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-md">
            <Film className="w-3 h-3 text-amber-400" />
            <span>{movie.quality || 'HD'}</span>
          </div>

          {/* Quick Favorite Button */}
          <button
            id={`fav-btn-${movie.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(movie);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md ${
              isFavorite
                ? 'theme-btn-primary scale-110 shadow-[0_0_12px_var(--color-glow)]'
                : 'bg-black/60 hover:bg-[var(--color-primary)] text-neutral-300 hover:text-white border border-white/20 hover:scale-110'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            aria-label="المفضلة"
          >
            <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isFavorite ? 'fill-white text-white scale-110' : ''}`} />
          </button>
        </div>

        {/* Center Hover Action Controls (Play & Details) */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-black/30 backdrop-blur-[2px]">
          <button
            id={`card-play-btn-${movie.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(movie);
            }}
            className="w-11 h-11 rounded-full theme-btn-gradient text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 cursor-pointer shadow-[0_0_20px_var(--color-glow)] hover:scale-110 active:scale-95"
            title="تشغيل الفيلم"
            aria-label="تشغيل الفيلم"
          >
            <Play className="w-5 h-5 fill-white mr-0.5" />
          </button>
        </div>

        {/* Bottom Details overlay */}
        <div className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ${layoutStyle === 'compact' ? 'p-2' : 'p-3'}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-300 mb-0.5">
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400" /> {movie.rating || 8.5}
            </span>
            <span>•</span>
            <span className="bg-white/10 px-1 rounded text-[9px] text-neutral-200">{movie.quality || 'WEB-DL'}</span>
            {movie.year && (
              <>
                <span>•</span>
                <span className="text-[9px] text-neutral-400">{movie.year}</span>
              </>
            )}
          </div>

          <h3 className={`font-extrabold text-white leading-tight line-clamp-1 group-hover:theme-text-primary transition-colors ${
            layoutStyle === 'compact' ? 'text-xs' : layoutStyle === 'backdrop' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
          }`}>
            {movie.title}
          </h3>

          {layoutStyle !== 'compact' && (
            <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
              {movie.genres && movie.genres.length > 0 ? movie.genres.join(' • ') : 'سينما • مترجم'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
