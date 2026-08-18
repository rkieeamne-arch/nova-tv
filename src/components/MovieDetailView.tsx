import { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Play, 
  Pause, 
  Star, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  Check, 
  Plus, 
  Sparkles, 
  Film,
  Clapperboard,
  Download,
  ExternalLink,
  Loader2,
  Server
} from 'lucide-react';
import { Movie, MovieServer } from '../types';
import { fetchMovieDetails } from '../services/movieApi';

interface MovieDetailViewProps {
  movie: Movie | null;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
  onSelectSimilarMovie: (movie: Movie) => void;
  allMovies: Movie[];
  initialPlay?: boolean;
}

function cleanTitleAndText(text: string): string {
  if (!text) return '';
  return text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    .replace(/[a-z0-9-]+\.(co|com|tv|net|org|site|online|club|info|xyz|top|app|me|cc|io|link|in|la)\b/gi, '')
    .replace(/سيما\s*لايت/gi, '')
    .replace(/كيو\s*فيلم/gi, '')
    .replace(/ايجي\s*بست/gi, '')
    .replace(/فاصل\s*اعلاني/gi, '')
    .replace(/ماي\s*سيما/gi, '')
    .replace(/وي\s*سيما/gi, '')
    .replace(/cimalight/gi, '')
    .replace(/qfilm/gi, '')
    .replace(/egybest/gi, '')
    .replace(/faselhd/gi, '')
    .replace(/mycima/gi, '')
    .replace(/wecima/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function MovieDetailView({
  movie,
  onBack,
  isFavorite,
  onToggleFavorite,
  onSelectSimilarMovie,
  allMovies,
  initialPlay = false,
}: MovieDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState(initialPlay);
  const [progress, setProgress] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'4K' | '1080p' | '720p'>('1080p');

  // Live server details fetched from CimaLight
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [servers, setServers] = useState<MovieServer[]>([]);
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string | null>(null);
  const [fullDescription, setFullDescription] = useState<string>('');

  useEffect(() => {
    setIsPlaying(initialPlay);
    setActiveEmbedUrl(null);
    if (movie) {
      setLoadingDetails(true);
      fetchMovieDetails(movie.id)
        .then((details) => {
          if (details) {
            if (details.servers && details.servers.length > 0) {
              setServers(details.servers);
              const streamServer = details.servers.find((s) => s.embedUrl);
              if (streamServer && streamServer.embedUrl) {
                setActiveEmbedUrl(streamServer.embedUrl);
              }
            }
            if (details.description || details.synopsis) {
              setFullDescription(details.description || details.synopsis || '');
            }
          }
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [initialPlay, movie]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !activeEmbedUrl) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeEmbedUrl]);

  // Generate a randomized set of similar movies for better discovery
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (movie && allMovies.length > 0) {
      const filtered = allMovies.filter((m) => m.id !== movie.id);
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      setSimilarMovies(shuffled.slice(0, 5));
    }
  }, [movie, allMovies]);

  if (!movie) return null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold text-sm">رجوع</span>
        </button>
      </div>

      {/* TOP SECTION: VIDEO PLAYER / BACKDROP BANNER */}
      <div className="relative w-full h-[40vh] md:h-[65vh] bg-black rounded-3xl overflow-hidden group shadow-2xl border border-white/10">
        {activeEmbedUrl && isPlaying ? (
          <iframe
            src={activeEmbedUrl}
            title={movie.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        ) : (
          <>
            <img
              src={movie.backdrop || movie.poster}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                isPlaying ? 'opacity-40 scale-105' : 'opacity-85'
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-black/60" />

            {/* Playing Simulation Animation */}
            {isPlaying && !activeEmbedUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full border border-red-600/40 text-red-400 text-xs font-mono mb-2 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    جاري البث السينمائي المباشر • {movie.videoQuality || '1080p FHD'}
                  </div>
                </div>
              </div>
            )}

            {/* Center Play/Pause Overlay Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.8)] transform hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white mr-1.5" />}
              </button>
            </div>

            {/* Player Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0a0b10] via-black/80 to-transparent z-20">
              {/* Scrubber Progress Bar */}
              <div
                className="relative w-full h-1.5 md:h-2 bg-white/20 hover:h-2 md:hover:h-3 rounded-full cursor-pointer transition-all mb-4 overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newProgress = (clickX / rect.width) * 100;
                  setProgress(Math.max(0, Math.min(100, newProgress)));
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_10px_rgba(220,38,38,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>

                  <button
                    onClick={() => setProgress(Math.max(0, progress - 5))}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer hidden sm:block"
                    title="ترجيع 10 ثواني"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setProgress(Math.min(100, progress + 5))}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer hidden sm:block"
                    title="تقديم 10 ثواني"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="text-[10px] md:text-xs font-mono text-neutral-300 bg-white/10 px-2 py-1 rounded-md">
                    {Math.floor((progress / 100) * 114)}:00 / {movie.duration || '120 دقيقة'}
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[10px] md:text-xs font-bold text-white theme-btn-primary px-2 py-1 rounded-md">
                    1080p
                  </span>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hover:text-red-400 transition-colors p-1 cursor-pointer flex-shrink-0"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* METADATA & ACTIONS */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-2">
        {/* Poster Image (Desktop) / Hidden on small screens if you want, or shown small */}
        <div className="hidden md:block w-56 lg:w-64 shrink-0">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src={movie.poster} 
              alt={movie.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 space-y-5 md:space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-amber-950/80 text-amber-300 border border-amber-700/50 text-[10px] md:text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" /> سينما
              </span>

              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px] md:text-xs font-mono font-bold px-3 py-1 rounded-md flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-emerald-400" /> {movie.rating || 8.5}
              </span>

              <span className="bg-[#1a1c26] text-neutral-300 text-[10px] md:text-xs font-bold px-3 py-1 rounded-md border border-white/5">
                {movie.quality || 'WEB-DL'}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">{movie.title}</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs md:text-sm font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-xl transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-black" />
              <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل الفيلم'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(movie)}
              className={`flex items-center gap-2 text-xs md:text-sm font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-xl border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                  : 'bg-[#1a1c26] hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              {isFavorite ? (
                <>
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-rose-400" />
                  <span>بالمفضلة</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span>للمفضلة</span>
                </>
              )}
            </button>
            
            {movie.watchUrl && (
              <a
                href={movie.watchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#1a1c26] hover:bg-white/10 border border-white/10 text-neutral-300 text-sm font-medium px-4 py-2.5 md:px-5 md:py-3 rounded-xl transition-colors"
                title="المصدر الأصلي"
              >
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </a>
            )}
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-sm font-bold text-neutral-400 mb-2">القصة</h4>
            <p className="text-sm md:text-base text-neutral-200 leading-relaxed max-w-4xl">
              {cleanTitleAndText(fullDescription || movie.synopsis || movie.description || '') || 'مشاهدة وتحميل الفيلم بجودة عالية وتجربة سينمائية مباشرة على NOVA TV.'}
            </p>
          </div>
        </div>
      </div>

      {/* REAL DOWNLOAD & STREAMING SERVERS SECTION */}
      <div className="mt-4 border-t border-white/10 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 md:w-5 md:h-5 theme-text-primary" />
            سيرفرات المشاهدة
          </h3>
          {loadingDetails && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-400">
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin theme-text-primary" />
              <span>جاري الفحص...</span>
            </div>
          )}
        </div>

        {servers.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {servers.map((srv, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const targetUrl = srv.embedUrl || srv.url;
                  if (targetUrl) {
                    setActiveEmbedUrl(targetUrl);
                    setIsPlaying(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border transition-all cursor-pointer group ${
                  srv.embedUrl
                    ? 'bg-red-950/20 hover:bg-red-950/40 border-red-900/50 hover:border-red-500 text-white'
                    : 'bg-[#12141d] hover:bg-[#1a1d2b] border-white/5 hover:border-white/20 text-neutral-200'
                }`}
              >
                {srv.type === 'stream' || srv.embedUrl ? (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-red-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                )}
                <div className="min-w-0 pr-1">
                  <span className="text-xs md:text-sm font-bold block truncate">{cleanTitleAndText(srv.name) || `سيرفر ${idx + 1}`}</span>
                  <span className="text-[9px] md:text-[10px] text-neutral-500 block -mt-0.5">
                    {srv.type === 'stream' || srv.embedUrl ? 'مشاهدة' : 'تحميل'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : !loadingDetails ? (
          <div className="text-center py-6 bg-[#12141d] rounded-xl border border-white/5">
            <span className="text-xs md:text-sm text-neutral-500">لا تتوفر سيرفرات إضافية، استخدم زر التشغيل الرئيسي.</span>
          </div>
        ) : null}
      </div>

      {/* Similar Recommendations */}
      {similarMovies.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-8">
          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            قد يعجبك أيضاً
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {similarMovies
              .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
              .map((sim, idx) => (
                <div
                  key={`sim-${sim.id}-${idx}`}
                onClick={() => {
                  onSelectSimilarMovie(sim);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative bg-[#12141d] rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/50 cursor-pointer transition-all duration-300"
              >
                <div className="aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={sim.poster}
                    alt={sim.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                  <h5 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {sim.title}
                  </h5>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-400 font-mono">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{sim.rating || 8.5}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
