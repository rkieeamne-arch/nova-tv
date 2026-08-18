export type MovieCategory = 
  | 'all'
  | 'english-movies2'
  | 'arabic-movies8'
  | 'action-movies'
  | 'turkish-movies'
  | 'animation-movies'
  | 'netflix'
  | 'asian-movies'
  | string;

export interface MovieServer {
  name: string;
  url: string;
  embedUrl?: string;
  type: 'stream' | 'download';
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  type?: 'horror' | 'general';
  category?: MovieCategory;
  poster: string;
  backdrop?: string;
  rating?: number;
  year?: number;
  duration?: string;
  ageRating?: string;
  horrorLevel?: number;
  quality?: string;
  synopsis?: string;
  description?: string;
  genres?: string[];
  director?: string;
  cast?: string[];
  watchUrl?: string;
  servers?: MovieServer[];
  isTrending?: boolean;
  isOriginal?: boolean;
  isPopular?: boolean;
  matchScore?: number;
  videoQuality?: '4K HDR' | 'FHD 1080p' | 'IMAX Enhanced' | string;
  source?: 'source1' | 'source2';
}

export interface WatchHistoryItem {
  id: string;
  movieId: string;
  movie: Movie;
  watchedAt: string;
  progressPercent: number;
  lastTimestamp: string;
  completed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isVip: boolean;
  plan: string;
  joinedDate: string;
  isLoggedIn: boolean;
}

export type MainViewTab = 'home' | 'movies' | 'favorites' | 'history' | 'search' | 'movie-detail' | 'settings';

export interface AppSettings {
  // Appearance Customization
  themeColor: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  fontFamily: 'cairo' | 'tajawal' | 'almarai' | 'readex';
  movieLayout: 'poster' | 'backdrop' | 'compact';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'horror' | 'info' | 'warning';
}
