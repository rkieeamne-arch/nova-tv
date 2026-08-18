import { useState, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Flame,
  Clapperboard,
  Loader2,
  Heart
} from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  featuredMovies: Movie[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isLoading?: boolean;
}

export function HeroBanner({
  featuredMovies,
  isFavorite,
  onToggleFavorite,
  onPlayMovie,
  onOpenDetails,
  isLoading = false,
}: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Drag & Touch Gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const minSwipeDistance = 40;

  // Auto-slide effect
  useEffect(() => {
    if (featuredMovies.length <= 1 || isLoading || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredMovies.length, isLoading, isPaused]);

  if (isLoading || featuredMovies.length === 0) {
    return (
      <div 
        id="hero-banner-loading" 
        className="relative w-full h-[380px] md:h-[460px] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-gradient-to-br from-[#121420] via-[#0a0c12] to-[#06070a] flex items-center justify-center p-6 text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-glow)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <Loader2 className="w-10 h-10 theme-text-primary animate-spin mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            جاري جلب أحدث الأفلام السينمائية المباشرة...
          </h2>
          <p className="text-xs text-neutral-400">
            يتم الاتصال بسيرفرات NOVA TV والبث السحابي لجلب أحدث الإصدارات
          </p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left in RTL (or drag left) -> Next
        handleNext();
      } else {
        // Swiped right in RTL -> Prev
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
    setIsPaused(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (isDragging.current && touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    isDragging.current = false;
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  const activeMovie = featuredMovies[currentIndex] || featuredMovies[0];

  return (
    <div 
      id="hero-banner-carousel-section"
      className="relative w-full mb-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center shadow-lg">
            <Flame className="w-4 h-4 theme-text-primary animate-bounce" />
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-wide">
            الأكثر شهرة وتصدراً
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
            اسحب يميناً أو يساراً للتنقل ⇆
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-[#12141d] hover:bg-[var(--color-primary)] border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-[#12141d] hover:bg-[var(--color-primary)] border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D CAROUSEL STAGE CONTAINER */}
      <div 
        className="relative w-full h-[400px] sm:h-[450px] md:h-[490px] rounded-3xl overflow-hidden bg-[#07080d] border border-white/10 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Blurred Dynamic Atmosphere Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 transition-all duration-1000 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${activeMovie.backdrop || activeMovie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/70 to-transparent pointer-events-none" />

        {/* SLIDES CONTAINER */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-4">
          {featuredMovies.map((movie, index) => {
            // Calculate relative offset from current index
            let offset = index - currentIndex;
            const total = featuredMovies.length;
            
            // Handle loop offset
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isLeft = offset === -1 || (currentIndex === 0 && index === total - 1);
            const isRight = offset === 1 || (currentIndex === total - 1 && index === 0);

            // Determine visibility & transforms
            let transformClass = 'opacity-0 pointer-events-none scale-50 z-0 hidden';
            if (isCenter) {
              transformClass = 'z-30 scale-100 opacity-100 translate-x-0 cursor-pointer';
            } else if (isLeft) {
              transformClass = 'z-20 scale-85 opacity-60 -translate-x-[52%] sm:-translate-x-[60%] cursor-pointer hover:opacity-80';
            } else if (isRight) {
              transformClass = 'z-20 scale-85 opacity-60 translate-x-[52%] sm:translate-x-[60%] cursor-pointer hover:opacity-80';
            } else if (Math.abs(offset) === 2) {
              transformClass = `z-10 scale-70 opacity-25 ${offset < 0 ? '-translate-x-[90%]' : 'translate-x-[90%]'} hidden sm:block`;
            }

            const isFav = isFavorite(movie.id);

            return (
              <div
                key={movie.id}
                onClick={() => {
                  if (!isCenter) setCurrentIndex(index);
                }}
                className={`absolute transition-all duration-500 ease-out transform ${transformClass}`}
                style={{
                  width: '260px',
                  height: '380px',
                  maxWidth: '85vw',
                }}
              >
                {/* Individual Movie Card Frame */}
                <div 
                  className={`w-full h-full rounded-2xl md:rounded-3xl overflow-hidden relative border bg-[#11131c] shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                    isCenter 
                      ? 'border-[var(--color-primary)] shadow-[0_0_35px_var(--color-glow)] ring-2 ring-[var(--color-primary)]/40' 
                      : 'border-white/15'
                  }`}
                >
                  {/* Poster Image */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />

                  {/* TOP CARD BADGES */}
                  <div className="relative z-10 p-3 flex items-center justify-between">
                    <span className="bg-black/70 backdrop-blur-md border border-white/20 text-emerald-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" />
                      {movie.rating || 8.5}
                    </span>

                    {/* Quick Favorite */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(movie);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                        isFav
                          ? 'theme-btn-primary shadow-lg'
                          : 'bg-black/60 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      aria-label="المفضلة"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* BOTTOM OVERLAY CONTENT */}
                  <div className="relative z-10 p-4 flex flex-col items-center text-center">
                    {/* Status Badge */}
                    <div className="mb-2">
                      <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>مباشر على NOVA TV</span>
                      </span>
                    </div>

                    {/* Movie Title */}
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2 mb-3 text-shadow-md">
                      {movie.title}
                    </h3>

                    {/* CTA Play Button */}
                    {isCenter && (
                      <div className="w-full flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayMovie(movie);
                          }}
                          className="flex-1 theme-btn-gradient text-white text-xs sm:text-sm font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>شاهد الآن</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(movie);
                          }}
                          className="bg-white/15 hover:bg-white/30 text-white p-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                          title="التفاصيل"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PAGINATION DOTS & COUNTER */}
        <div className="absolute bottom-3 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-glow)]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`شريحة ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
