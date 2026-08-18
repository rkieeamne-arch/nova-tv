import { Movie, MovieServer } from '../types';

export interface CategoryInfo {
  id: string;
  name: string;
  icon?: string;
}

export interface SearchResultData {
  results: Movie[];
  source1: Movie[];
  source2: Movie[];
}

export const CIMALIGHT_CATEGORIES: CategoryInfo[] = [
  { id: 'english-movies2', name: 'أفلام أجنبية' },
  { id: 'action-movies', name: 'أفلام أكشن' },
  { id: 'arabic-movies8', name: 'أفلام عربية' },
  { id: 'turkish-movies', name: 'أفلام تركية' },
  { id: 'animation-movies', name: 'كرتون وأنيميشن' },
  { id: 'netflix', name: 'أفلام نتفلكس' },
  { id: 'asian-movies', name: 'أفلام آسيوية' },
];

export async function fetchMoviesByCategory(cat: string = 'english-movies2', page: number = 1): Promise<Movie[]> {
  try {
    const res = await fetch(`/api/movies/list?cat=${encodeURIComponent(cat)}&page=${page}`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.movies)) {
      return data.movies
        .filter((m: any) => {
          const title = (m.title || '').toLowerCase();
          const desc = (m.description || '').toLowerCase();
          return !(
            title.includes('رعب') ||
            title.includes('horror') ||
            title.includes('مخيف') ||
            title.includes('مرعب') ||
            title.includes('scary') ||
            title.includes('spooky') ||
            title.includes('الأرواح') ||
            title.includes('الجن') ||
            desc.includes('رعب') ||
            desc.includes('horror')
          );
        })
        .map((m: any) => ({
          id: m.id,
          title: m.title,
          originalTitle: m.originalTitle || m.title,
          poster: m.poster,
          backdrop: m.backdrop || m.poster,
          duration: m.duration || '120 دقيقة',
          quality: m.quality || 'HD',
          videoQuality: m.quality || '1080p FHD',
          rating: m.rating || 8.5,
          year: m.year || 2024,
          type: 'general' as const,
          category: cat,
          source: (m.source || (m.id.startsWith('qf_') ? 'source2' : 'source1')) as 'source1' | 'source2',
          synopsis: m.description || 'مشاهدة وتحميل بجودة عالية عبر سيرفرات NOVA TV المباشرة.',
          description: m.description,
          genres: [
            cat.includes('action') ? 'أكشن' : cat.includes('arabic') ? 'عربي' : cat.includes('turkish') ? 'تركي' : 'سينما عالمية',
            'مترجم',
            m.quality || 'HD'
          ],
          watchUrl: m.watchUrl,
          servers: m.servers || [],
          isTrending: Math.random() > 0.6,
          isOriginal: Math.random() > 0.8,
        }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchMovieDetails(vid: string): Promise<Partial<Movie> | null> {
  try {
    const res = await fetch(`/api/movies/details?vid=${encodeURIComponent(vid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.movie) {
      const m = data.movie;
      return {
        id: m.id,
        title: m.title,
        poster: m.poster,
        backdrop: m.backdrop || m.poster,
        synopsis: m.description,
        description: m.description,
        duration: m.duration,
        watchUrl: m.watchUrl,
        servers: m.servers || [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function searchMovies(query: string): Promise<SearchResultData> {
  if (!query || !query.trim()) return { results: [], source1: [], source2: [] };
  try {
    const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return { results: [], source1: [], source2: [] };
    const data = await res.json();

    const mapMovie = (m: any) => ({
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle || m.title,
      poster: m.poster,
      backdrop: m.backdrop || m.poster,
      duration: m.duration || '120 دقيقة',
      quality: m.quality || 'HD',
      videoQuality: m.quality || 'HD',
      rating: m.rating || 8.5,
      year: m.year || 2024,
      type: 'general' as const,
      category: 'search',
      source: (m.source || (m.id.startsWith('qf_') ? 'source2' : 'source1')) as 'source1' | 'source2',
      synopsis: m.description || 'مشاهدة وتحميل بجودة عالية عبر سيرفرات NOVA TV.',
      description: m.description,
      genres: ['سينما', 'مترجم'],
      watchUrl: m.watchUrl,
      servers: m.servers || [],
    });

    const isHorror = (m: any) => {
      const title = (m.title || '').toLowerCase();
      const desc = (m.description || '').toLowerCase();
      return (
        title.includes('رعب') ||
        title.includes('horror') ||
        title.includes('مخيف') ||
        title.includes('مرعب') ||
        title.includes('scary') ||
        title.includes('spooky') ||
        title.includes('الأرواح') ||
        title.includes('الجن') ||
        desc.includes('رعب') ||
        desc.includes('horror')
      );
    };

    const results = Array.isArray(data.results) ? data.results.filter(m => !isHorror(m)).map(mapMovie) : [];
    const source1 = Array.isArray(data.source1) ? data.source1.filter(m => !isHorror(m)).map(mapMovie) : [];
    const source2 = Array.isArray(data.source2) ? data.source2.filter(m => !isHorror(m)).map(mapMovie) : [];

    return { results, source1, source2 };
  } catch {
    return { results: [], source1: [], source2: [] };
  }
}
