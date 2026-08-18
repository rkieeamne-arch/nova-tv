import React, { useState, useEffect, useCallback } from 'react';
import { 
  Film, 
  Search, 
  Heart, 
  History, 
  Sparkles, 
  Tv,
  Play,
  Clapperboard,
  Layers,
  Loader2,
  RefreshCw,
  Flame,
  Zap,
  Globe,
  ChevronDown,
  Cast,
  X
} from 'lucide-react';
import { 
  Movie, 
  WatchHistoryItem, 
  UserProfile, 
  AppSettings, 
  MainViewTab, 
  ToastMessage, 
  MovieCategory 
} from './types';
import { 
  DEFAULT_USER, 
  DEFAULT_SETTINGS 
} from './data/mockMovies';
import { 
  fetchMoviesByCategory, 
  searchMovies, 
  CIMALIGHT_CATEGORIES,
  CategoryInfo 
} from './services/movieApi';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieSection } from './components/MovieSection';
import { MovieCard } from './components/MovieCard';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { MovieDetailView } from './components/MovieDetailView';
import { ToastContainer } from './components/Toast';
import { CinematicIntro } from './components/CinematicIntro';
import { AuthModal } from './components/AuthModal';
import { supabase, supabaseGetProfile } from './lib/supabase';

export default function App() {
  // --- Intro Cinematic State ---
  const [showIntro, setShowIntro] = useState<boolean>(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // --- Live CimaLight Movies State ---
  const [isLoadingHome, setIsLoadingHome] = useState<boolean>(true);
  const [englishMovies, setEnglishMovies] = useState<Movie[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [arabicMovies, setArabicMovies] = useState<Movie[]>([]);
  const [turkishMovies, setTurkishMovies] = useState<Movie[]>([]);

  // Catalog tab states
  const [selectedCatalogCat, setSelectedCatalogCat] = useState<string>('english-movies2');
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);
  const [hasMoreCatalog, setHasMoreCatalog] = useState<boolean>(true);

  // --- Persistent States (Favorites, History, User, Settings) ---
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nova_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedFavoritesMovies, setSavedFavoritesMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('nova_favorite_movies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nova_user');
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('nova_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI Navigation & Search States
  const [activeTab, setActiveTab] = useState<MainViewTab>('home');
  const [previousTab, setPreviousTab] = useState<MainViewTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [source1Results, setSource1Results] = useState<Movie[]>([]);
  const [source2Results, setSource2Results] = useState<Movie[]>([]);
  const [activeSearchSource, setActiveSearchSource] = useState<'all' | 'source1' | 'source2'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Smart TV Casting & Receiver States
  const [castPairingCode, setCastPairingCode] = useState('');
  const [isCasting, setIsCasting] = useState(false);
  const [pairedTvSession, setPairedTvSession] = useState<string | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [castModalTab, setCastModalTab] = useState<'pair' | 'guide'>('pair');
  const [isTvReceiverMode, setIsTvReceiverMode] = useState(false);
  const [tvPairingCode, setTvPairingCode] = useState('');
  const [tvSessionId, setTvSessionId] = useState('');
  const [tvCurrentMovie, setTvCurrentMovie] = useState<Movie | null>(null);
  const [tvPlayerAction, setTvPlayerAction] = useState<string | null>(null);

  // Modals & Drawers States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [autoPlayDetail, setAutoPlayDetail] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global Ad Popup Blocker to prevent unwanted popup windows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.open = function () {
        console.warn('Blocked popup ad window attempt.');
        return null;
      };
    }
  }, []);

  // Supabase Auth Session Management & Verification Redirect Handler
  useEffect(() => {
    // Check if user landed from an email verification link (hash contains access_token)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery')) {
        addToast('تم تأكيد البريد الإلكتروني!', 'تم تفعيل حسابك بنجاح ومزامنته مع NOVA TV.', 'success');
        // Clean up URL hash so page stays clean
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    if (!supabase) {
      // Load local guest/trial session if present
      const localEmail = localStorage.getItem('nova_user_email');
      const localUsername = localStorage.getItem('nova_user_username');
      const localAvatar = localStorage.getItem('nova_user_avatar');
      if (localEmail && localUsername && localAvatar) {
        setUser((prev) => ({
          ...prev,
          id: 'local_guest',
          email: localEmail,
          name: localUsername,
          avatar: localAvatar,
          isLoggedIn: true,
        }));
      }
      return;
    }

    // Load initial session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const defaultName = u.user_metadata?.username || u.email?.split('@')[0] || 'مستخدم NOVA';
        const defaultAvatar = u.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80';

        setUser((prev) => ({
          ...prev,
          id: u.id,
          email: u.email || '',
          name: defaultName,
          avatar: defaultAvatar,
          isLoggedIn: true,
        }));

        supabaseGetProfile(u.id).then((prof) => {
          if (prof) {
            setUser((prev) => ({
              ...prev,
              name: prof.username || prev.name,
              avatar: prof.avatar_url || prev.avatar,
            }));
          }
        });
      }
    });

    // Listen to real-time Auth State changes (Login, Logout, Signup, Email Confirmation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const defaultName = u.user_metadata?.username || u.email?.split('@')[0] || 'مستخدم NOVA';
        const defaultAvatar = u.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80';

        let name = defaultName;
        let avatar = defaultAvatar;

        const prof = await supabaseGetProfile(u.id);
        if (prof) {
          if (prof.username) name = prof.username;
          if (prof.avatar_url) avatar = prof.avatar_url;
        }

        setUser((prev) => ({
          ...prev,
          id: u.id,
          email: u.email || '',
          name,
          avatar,
          isLoggedIn: true,
        }));

        if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser((prev) => ({
          ...prev,
          id: '',
          email: 'guest@novatv.app',
          name: 'زائر',
          isLoggedIn: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nova_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('nova_favorite_movies', JSON.stringify(savedFavoritesMovies));
  }, [savedFavoritesMovies]);

  useEffect(() => {
    localStorage.setItem('nova_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('nova_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nova_settings', JSON.stringify(settings));
    const theme = settings.themeColor || 'red';
    const font = settings.fontFamily || 'cairo';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-font', font);

    // Direct CSS variable injection for instant font switching
    const fontNames: Record<string, string> = {
      cairo: "'Cairo', system-ui, -apple-system, sans-serif",
      tajawal: "'Tajawal', system-ui, -apple-system, sans-serif",
      almarai: "'Almarai', system-ui, -apple-system, sans-serif",
      readex: "'Readex Pro', system-ui, -apple-system, sans-serif",
    };
    if (fontNames[font]) {
      document.documentElement.style.setProperty('--font-active', fontNames[font]);
      document.body.style.setProperty('font-family', fontNames[font], 'important');
    }

    // Direct CSS variable injection for instant theme color switching
    const themeColors: Record<string, { primary: string; hover: string; glow: string; subtle: string; from: string; to: string }> = {
      red: { primary: '#dc2626', hover: '#b91c1c', glow: 'rgba(220, 38, 38, 0.45)', subtle: 'rgba(220, 38, 38, 0.15)', from: '#dc2626', to: '#991b1b' },
      blue: { primary: '#2563eb', hover: '#1d4ed8', glow: 'rgba(37, 99, 235, 0.45)', subtle: 'rgba(37, 99, 235, 0.15)', from: '#2563eb', to: '#1e40af' },
      green: { primary: '#059669', hover: '#047857', glow: 'rgba(5, 150, 105, 0.45)', subtle: 'rgba(5, 150, 105, 0.15)', from: '#059669', to: '#065f46' },
      amber: { primary: '#d97706', hover: '#b45309', glow: 'rgba(217, 119, 6, 0.45)', subtle: 'rgba(217, 119, 6, 0.15)', from: '#d97706', to: '#92400e' },
      purple: { primary: '#9333ea', hover: '#7e22ce', glow: 'rgba(147, 51, 234, 0.45)', subtle: 'rgba(147, 51, 234, 0.15)', from: '#9333ea', to: '#6b21a8' },
    };
    if (themeColors[theme]) {
      const tc = themeColors[theme];
      document.documentElement.style.setProperty('--color-primary', tc.primary);
      document.documentElement.style.setProperty('--color-primary-hover', tc.hover);
      document.documentElement.style.setProperty('--color-glow', tc.glow);
      document.documentElement.style.setProperty('--color-accent-subtle', tc.subtle);
      document.documentElement.style.setProperty('--color-gradient-from', tc.from);
      document.documentElement.style.setProperty('--color-gradient-to', tc.to);
    }
  }, [settings]);

  // Initial Load: Fetch Live Movies from CimaLight
  const loadHomeData = useCallback(async () => {
    setIsLoadingHome(true);
    try {
      const [english, animation, action, arabic, turkish] = await Promise.all([
        fetchMoviesByCategory('english-movies2', 1),
        fetchMoviesByCategory('animation-movies', 1),
        fetchMoviesByCategory('action-movies', 1),
        fetchMoviesByCategory('arabic-movies8', 1),
        fetchMoviesByCategory('turkish-movies', 1),
      ]);

      setEnglishMovies(english);
      setAnimationMovies(animation);
      setActionMovies(action);
      setArabicMovies(arabic);
      setTurkishMovies(turkish);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setIsLoadingHome(false);
    }
  }, []);

  // Background silent fetch for live updates
  const backgroundRefreshData = useCallback(async () => {
    try {
      const [english, animation, action, arabic, turkish] = await Promise.all([
        fetchMoviesByCategory('english-movies2', 1),
        fetchMoviesByCategory('animation-movies', 1),
        fetchMoviesByCategory('action-movies', 1),
        fetchMoviesByCategory('arabic-movies8', 1),
        fetchMoviesByCategory('turkish-movies', 1),
      ]);

      setAnimationMovies(animation);

      setActionMovies(prev => {
        if (prev.length > 0 && action.length > 0 && prev[0].id !== action[0].id) {
          window.dispatchEvent(new CustomEvent('nova-toast', { detail: { title: 'فيلم جديد!', description: `تمت إضافة الفيلم الجديد "${action[0].title}" للتو.`, type: 'success' } }));
        }
        return action;
      });

      setEnglishMovies(english);
      setArabicMovies(arabic);
      setTurkishMovies(turkish);
    } catch (err) {
      // Ignore background errors
    }
  }, []);

  useEffect(() => {
    loadHomeData();

    // Auto refresh data every 5 minutes in the background
    const interval = setInterval(() => {
      backgroundRefreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadHomeData, backgroundRefreshData]);

  // Load Catalog Movies when category changes
  useEffect(() => {
    if (activeTab === 'movies') {
      setIsLoadingCatalog(true);
      setCatalogPage(1);
      fetchMoviesByCategory(selectedCatalogCat, 1)
        .then((items) => {
          setCatalogMovies(items);
          setHasMoreCatalog(items.length > 0);
        })
        .finally(() => setIsLoadingCatalog(false));
    }
  }, [activeTab, selectedCatalogCat]);

  // Load Next Page of Catalog
  const handleLoadMoreCatalog = async () => {
    if (isLoadingCatalog || !hasMoreCatalog) return;
    setIsLoadingCatalog(true);
    const nextPage = catalogPage + 1;
    try {
      const newItems = await fetchMoviesByCategory(selectedCatalogCat, nextPage);
      if (newItems.length > 0) {
        setCatalogMovies((prev) => {
          const combined = [...prev, ...newItems];
          return combined.filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx);
        });
        setCatalogPage(nextPage);
      } else {
        setHasMoreCatalog(false);
      }
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Toast Helpers
  const addToast = (title: string, description?: string, type: 'success' | 'horror' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleNovaToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, description, type } = customEvent.detail;
      addToast(title, description, type);
    };
    window.addEventListener('nova-toast', handleNovaToast);
    return () => window.removeEventListener('nova-toast', handleNovaToast);
  }, []);

  // Favorites Helpers
  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleFavorite = (movie: Movie) => {
    if (favoriteIds.includes(movie.id)) {
      setFavoriteIds((prev) => prev.filter((id) => id !== movie.id));
      setSavedFavoritesMovies((prev) => prev.filter((m) => m.id !== movie.id));
      addToast('تمت الإزالة من المفضلة', `تم حذف ${movie.title} من قائمتك`, 'info');
    } else {
      setFavoriteIds((prev) => [...prev, movie.id]);
      setSavedFavoritesMovies((prev) => [movie, ...prev.filter((m) => m.id !== movie.id)]);
      addToast(
        'تمت الإضافة إلى المفضلة',
        `أصبح ${movie.title} متاحاً في قائمة أفلامك المفضلة`,
        movie.type === 'horror' ? 'horror' : 'success'
      );
    }
  };

  const clearAllFavorites = () => {
    setFavoriteIds([]);
    setSavedFavoritesMovies([]);
    addToast('تم إفراغ قائمة المفضلة', 'تم حذف جميع الأفلام المفضلة', 'info');
  };

  // Watch History Helpers
  const recordWatch = (movie: Movie) => {
    setHistory((prev) => {
      const existing = prev.find((item) => item.movieId === movie.id);
      const updatedItem: WatchHistoryItem = {
        id: existing ? existing.id : `hist-${Date.now()}`,
        movieId: movie.id,
        movie,
        watchedAt: 'الآن',
        progressPercent: existing ? Math.min(100, existing.progressPercent + 15) : 25,
        lastTimestamp: '00:24:10',
        completed: false,
      };
      return [updatedItem, ...prev.filter((item) => item.movieId !== movie.id)];
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    addToast('تم الحذف من السجل', '', 'info');
  };

  const clearAllHistory = () => {
    setHistory([]);
    addToast('تم مسح سجل المشاهدة', 'تم حذف جميع السجلات السابقة', 'info');
  };

  // Smart TV Casting Core Logic
  useEffect(() => {
    if (!isTvReceiverMode || !tvSessionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/cast/poll-tv?tvSessionId=${tvSessionId}`);
        const data = await response.json();
        if (data.success) {
          if (data.currentMovie) {
            setTvCurrentMovie(data.currentMovie);
          }
          if (data.action) {
            setTvPlayerAction(data.action);
          }
        }
      } catch (err) {
        console.error('Failed to poll TV cast commands:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isTvReceiverMode, tvSessionId]);

  const connectAndCastToTv = async (code: string) => {
    if (!code) {
      addToast('خطأ', 'الرجاء إدخال رمز الاقتران المكون من 6 أرقام', 'warning');
      return;
    }
    
    const cleanCode = code.replace(/\s+/g, '');
    try {
      const response = await fetch('/api/cast/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });
      const data = await response.json();
      if (data.success) {
        setIsCasting(true);
        setCastPairingCode(cleanCode);
        setPairedTvSession(data.tvSessionId);
        addToast('تم الاتصال بنجاح! 📺', 'تم إقران الهاتف بالتلفاز. سيتم بث أي فيلم تشغله الآن مباشرة على شاشتك الكبيرة.', 'success');
        setIsCastModalOpen(false);
      } else {
        addToast('فشل الاتصال', data.error || 'رمز الاقتران غير صحيح', 'warning');
      }
    } catch (err) {
      addToast('خطأ في الاتصال', 'تعذر الاتصال بالخادم. يرجى التحقق من الشبكة.', 'warning');
    }
  };

  // Automatically connect if "pair" query parameter is present in URL (QR Code flow)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pairCode = params.get('pair') || params.get('code');
      if (pairCode) {
        const cleanCode = pairCode.replace(/\s+/g, '');
        if (cleanCode.length === 6) {
          setCastPairingCode(cleanCode);
          connectAndCastToTv(cleanCode);
          // Clean URL params to keep the URL nice and clean
          const newUrl = window.location.pathname;
          window.history.replaceState(null, '', newUrl);
        }
      }
    }
  }, []);

  const castCommandToTv = async (action: 'play' | 'pause' | 'stop') => {
    if (!castPairingCode) return;
    try {
      await fetch('/api/cast/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: castPairingCode, action }),
      });
      if (action === 'stop') {
        setIsCasting(false);
        addToast('تم إنهاء البث', 'تم قطع الاتصال بشاشة التلفاز بنجاح.', 'info');
      }
    } catch (err) {
      console.error('Failed to send cast action:', err);
    }
  };

  const playMovieOnTv = async (movie: Movie) => {
    if (!castPairingCode) return;
    try {
      const response = await fetch('/api/cast/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: castPairingCode, movie }),
      });
      const data = await response.json();
      if (data.success) {
        addToast('جاري التشغيل على التلفاز 📺', `تم إرسال فيلم "${movie.title}" لشاشة التلفاز بنجاح.`, 'success');
      } else {
        addToast('خطأ', data.error || 'تعذر بدء التشغيل على شاشة التلفاز', 'warning');
      }
    } catch (err) {
      addToast('خطأ في البث', 'يرجى التأكد من اتصال التلفاز بالإنترنت.', 'warning');
    }
  };

  const initializeTvReceiverMode = async () => {
    try {
      const response = await fetch('/api/cast/generate-code');
      const data = await response.json();
      if (data.success) {
        setTvPairingCode(data.code);
        setTvSessionId(data.tvSessionId);
        setIsTvReceiverMode(true);
        setTvCurrentMovie(null);
        addToast('وضعية مستقبل التلفاز نشطة 📺', 'شاشتك الآن مهيأة لتلقي البث المباشر والتحكم من أي جهاز آخر.', 'info');
      }
    } catch (err) {
      addToast('خطأ', 'فشل تهيئة وضع استقبال التلفاز', 'warning');
    }
  };

  // Action handlers
  const handlePlayMovie = (movie: Movie) => {
    if (isCasting) {
      playMovieOnTv(movie);
      return;
    }
    setPreviousTab(activeTab === 'movie-detail' ? previousTab : activeTab);
    setSelectedMovie(movie);
    setAutoPlayDetail(true);
    setActiveTab('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    recordWatch(movie);
    addToast('بدء البث السينمائي', `جاري تشغيل ${movie.title}`, movie.type === 'horror' ? 'horror' : 'success');
  };

  const handleOpenDetails = (movie: Movie) => {
    setPreviousTab(activeTab === 'movie-detail' ? previousTab : activeTab);
    setSelectedMovie(movie);
    setAutoPlayDetail(false);
    setActiveTab('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Aggregate all loaded movies for similar recommendations
  const allCurrentMovies = React.useMemo(() => {
    const combined = [
      ...englishMovies,
      ...animationMovies,
      ...actionMovies,
      ...arabicMovies,
      ...turkishMovies,
      ...catalogMovies,
      ...savedFavoritesMovies,
    ];
    return combined
      .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
      .filter((m) => {
        const titleLower = (m.title || '').toLowerCase();
        const descLower = (m.description || m.synopsis || '').toLowerCase();
        const isHorror = 
          titleLower.includes('رعب') || 
          titleLower.includes('horror') || 
          titleLower.includes('مخيف') || 
          titleLower.includes('مرعب') || 
          titleLower.includes('scary') || 
          titleLower.includes('spooky') || 
          titleLower.includes('الأرواح') || 
          titleLower.includes('الجن') ||
          descLower.includes('رعب') ||
          descLower.includes('horror');
        return !isHorror;
      });
  }, [
    englishMovies, animationMovies, actionMovies, arabicMovies, turkishMovies, catalogMovies, savedFavoritesMovies
  ]);

  // Debounced Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSource1Results([]);
      setSource2Results([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const query = searchQuery.toLowerCase().trim();
        const searchData = await searchMovies(query);
        
        if (searchData.results.length === 0) {
          const localResults = allCurrentMovies.filter(m => 
            m.title.toLowerCase().includes(query) || 
            (m.originalTitle && m.originalTitle.toLowerCase().includes(query)) ||
            (m.description && m.description.toLowerCase().includes(query)) ||
            (m.synopsis && m.synopsis.toLowerCase().includes(query))
          );
          
          const uniqueLocal = localResults.filter((m, idx, arr) => 
            arr.findIndex(x => x.id === m.id) === idx
          );
          
          setSearchResults(uniqueLocal);
          setSource1Results(uniqueLocal.filter(m => !m.id.startsWith('qf_')));
          setSource2Results(uniqueLocal.filter(m => m.id.startsWith('qf_')));
        } else {
          setSearchResults(searchData.results);
          setSource1Results(searchData.source1);
          setSource2Results(searchData.source2);
        }
      } catch (err) {
        console.error('Search error:', err);
        const query = searchQuery.toLowerCase().trim();
        const localResults = allCurrentMovies.filter(m => 
          m.title.toLowerCase().includes(query) || 
          (m.originalTitle && m.originalTitle.toLowerCase().includes(query)) ||
          (m.description && m.description.toLowerCase().includes(query))
        );
        setSearchResults(localResults);
        setSource1Results(localResults.filter(m => !m.id.startsWith('qf_')));
        setSource2Results(localResults.filter(m => m.id.startsWith('qf_')));
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, allCurrentMovies]);

  // Featured movies for hero
  const heroMovies = englishMovies.slice(0, 5).length > 0 
    ? englishMovies.slice(0, 5) 
    : allCurrentMovies.slice(0, 5);

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'tajawal':
        return "font-tajawal";
      case 'almarai':
        return "font-almarai";
      case 'readex':
        return "font-readex";
      case 'cairo':
      default:
        return "font-cairo";
    }
  };

  const getLayoutGridClass = () => {
    if (settings.movieLayout === 'backdrop') {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
    }
    if (settings.movieLayout === 'compact') {
      return 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5 sm:gap-3';
    }
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
  };

  if (isTvReceiverMode) {
    return (
      <div
        id="tv-receiver-root"
        dir="rtl"
        data-theme={settings.themeColor || 'red'}
        data-font={settings.fontFamily || 'cairo'}
        className={`fixed inset-0 z-50 bg-[#050609] text-white flex flex-col justify-between p-8 overflow-hidden select-none ${getFontFamilyClass()}`}
      >
        {/* TV Receiver Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border-subtle border p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Tv className="w-5 h-5 theme-text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-['Outfit'] font-black text-xl tracking-wider text-white flex items-center gap-1">
                NOVA<span className="theme-text-primary">TV</span>
              </span>
              <span className="text-[10px] text-green-400 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                وضعية استقبال التلفاز الذكي نشطة
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsTvReceiverMode(false)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            إغلاق شاشة التلفاز
          </button>
        </div>

        {/* TV Receiver Main Body */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-12 w-full">
          {tvCurrentMovie ? (
            /* Movie Playing on TV Receiver */
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group">
                <iframe
                  src={tvCurrentMovie.servers?.[0]?.embedUrl || `https://vidsrc.to/embed/movie/${tvCurrentMovie.id}`}
                  title={tvCurrentMovie.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
                
                {/* TV Player Mini Info Overlay */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-bold text-white">{tvCurrentMovie.title}</span>
                  <span className="text-[10px] bg-[var(--color-primary)] px-1.5 py-0.5 rounded font-bold">بث مباشر</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => setTvCurrentMovie(null)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer"
                >
                  إنهاء البث والمشاهدة الحالي
                </button>
              </div>
            </div>
          ) : (
            /* Pairing screen on TV */
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-500">
                  <Cast className="w-8 h-8 animate-bounce" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl font-sans">جاهز للاستقبال والاقتران السينمائي</h1>
                <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  افتح تطبيق <span className="text-white font-bold">NOVA TV</span> على هاتفك أو جهازك اللوحي. يمكنك استخدام كاميرا الهاتف لمسح الرمز السريع للتوصيل الفوري، أو إدخال الرقم يدوياً:
                </p>
              </div>

              {/* Unique Pairing Code & QR Code */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white/5 border border-white/10 p-8 rounded-3xl inline-flex shadow-2xl relative group max-w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-amber-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Text pairing code */}
                <div className="text-right space-y-2 relative">
                  <span className="text-xs font-bold text-neutral-400 block">رمز الاقتران الرقمي:</span>
                  <span className="text-4xl md:text-5xl font-extrabold tracking-[0.2em] text-[var(--color-primary)] font-mono select-all block">
                    {tvPairingCode ? `${tvPairingCode.slice(0, 3)} ${tvPairingCode.slice(3)}` : 'جاري التوليد...'}
                  </span>
                </div>

                {/* Divider line (desktop) */}
                <div className="hidden md:block w-[1px] h-16 bg-white/10" />

                {/* QR Code image */}
                <div className="flex flex-col items-center gap-2 relative">
                  {tvPairingCode ? (
                    <div className="p-3 bg-white rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '?pair=' + tvPairingCode)}`}
                        alt="انقر للمسح الضوئي"
                        className="w-[120px] h-[120px]"
                      />
                    </div>
                  ) : (
                    <div className="w-[120px] h-[120px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-neutral-500">
                      جاري التحميل...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-neutral-400">امسح الكود بكاميرا الهاتف للاقتران والفتح فورا 📸</span>
                </div>
              </div>

              {/* Loading indicator */}
              <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>بانتظار استقبال أمر تشغيل من هاتفك الذكي...</span>
              </div>
            </div>
          )}
        </div>

        {/* TV Receiver Footer */}
        <div className="text-center text-xs text-neutral-500 border-t border-white/5 pt-4">
          <span>NOVA TV Cast Receiver v2.0 • يتطلب اتصال كلا الجهازين بالإنترنت</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="nova-tv-root"
      dir="rtl"
      data-theme={settings.themeColor || 'red'}
      data-font={settings.fontFamily || 'cairo'}
      className={`min-h-screen text-[#e0e2ec] transition-colors duration-500 bg-[#0a0b10] selection:bg-[var(--color-primary)] ${getFontFamilyClass()}`}
    >
      {/* Cinematic Intro Splash Screen */}
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      {/* Navigation Bars (Desktop Sidebar + Mobile Bars) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favoriteIds.length}
        historyCount={history.length}
        user={user}
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReplayIntro={handleReplayIntro}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isCasting={isCasting}
        onOpenCastModal={() => setIsCastModalOpen(true)}
        onOpenTvReceiver={initializeTvReceiverMode}
      />

      {/* MAIN CONTENT AREA */}
      <main
        id="main-viewport"
        className={`transition-all duration-300 pt-16 md:pt-24 pb-20 md:pb-12 px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto ${
          isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64'
        }`}
      >
        {/* --- VIEW: SEARCH TAB --- */}
        {activeTab === 'search' && (
          <div id="search-view" className="py-4">
            <div className="mb-6">
              <div className="relative max-w-xl">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                ) : (
                  <Search className="w-5 h-5 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن فيلم، مسلسل، ممثل، أو سنة الإصدار..."
                  className="w-full bg-[#12141e] border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Search results view */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 theme-text-primary animate-spin mb-3" />
                <p className="text-sm text-neutral-300 font-medium">جاري البحث المباشر في المصدر السينمائي...</p>
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="text-center py-20 bg-[#0e1017] rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
                <Search className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">لم يتم العثور على نتائج</h3>
                <p className="text-xs text-neutral-400">
                  جرب البحث باسم فيلم آخر أو جزء من العنوان.
                </p>
              </div>
            ) : searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-glow)]"></span>
                    نتائج البحث ({searchResults.length})
                  </h3>
                </div>
                <div className={getLayoutGridClass()}>
                  {searchResults
                    .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
                    .map((movie, idx) => (
                      <div key={`sr-${movie.id}-${idx}`} className="flex justify-center w-full">
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          isFavorite={isFavorite(movie.id)}
                          onToggleFavorite={toggleFavorite}
                          onPlay={handlePlayMovie}
                          onOpenDetails={handleOpenDetails}
                          layoutStyle={settings.movieLayout || 'poster'}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: HOME TAB --- */}
        {activeTab === 'home' && (
          <div id="home-view">
            {/* Cinematic Hero Showcase Banner */}
            <HeroBanner
              featuredMovies={heroMovies}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onPlayMovie={handlePlayMovie}
              onOpenDetails={handleOpenDetails}
              isLoading={isLoadingHome}
            />

            {isLoadingHome && englishMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
                <p className="text-sm text-neutral-300 font-medium">جاري تحميل الأفلام وسيرفرات البث...</p>
              </div>
            ) : (
              <>
                {/* Section 1: Latest Combined Movies */}
                {allCurrentMovies.length > 0 && (
                  <MovieSection
                    id="section-latest"
                    title="أحدث الأفلام المضافة"
                    subtitle="جميع الأفلام الأجنبية، التركية، والعربية المترجمة"
                    icon="general"
                    movies={allCurrentMovies}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                    onPlayMovie={handlePlayMovie}
                    onOpenDetails={handleOpenDetails}
                    layoutStyle={settings.movieLayout || 'poster'}
                    isGrid={true}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* --- VIEW: MOVIES TAB --- */}
        {activeTab === 'movies' && (
          <div id="movies-catalog-view" className="py-2">
            {/* Header & Category Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                    مكتبة الأفلام
                    <span className="text-sm font-normal text-neutral-400 bg-[#171822] px-2.5 py-0.5 rounded-full border border-white/10">
                      {catalogMovies.length} عمل
                    </span>
                  </h1>
                </div>
              </div>

              {/* Controls: Select Category & Refresh */}
              <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <select
                    value={selectedCatalogCat}
                    onChange={(e) => setSelectedCatalogCat(e.target.value)}
                    className="w-full appearance-none bg-[#12141d] border border-white/10 text-white text-sm font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                  >
                    {CIMALIGHT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => {
                    setIsLoadingCatalog(true);
                    fetchMoviesByCategory(selectedCatalogCat, 1)
                      .then((items) => {
                        setCatalogMovies(items);
                        setCatalogPage(1);
                      })
                      .finally(() => setIsLoadingCatalog(false));
                  }}
                  className="flex items-center justify-center bg-[#12141d] hover:bg-white/10 border border-white/10 text-neutral-300 w-12 h-12 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoadingCatalog ? 'animate-spin text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Catalog Movies Grid */}
            {isLoadingCatalog && catalogMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
                <p className="text-sm text-neutral-300">جاري جلب الأفلام من القسم المحدد...</p>
              </div>
            ) : catalogMovies.length === 0 ? (
              <div className="text-center py-20 bg-[#0e1017] rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
                <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">لا توجد أفلام في هذا القسم حالياً</h3>
                <p className="text-xs text-neutral-400">
                  يرجى اختيار تصنيف آخر أو إعادة تحديث الصفحة.
                </p>
              </div>
            ) : (
              <>
                <div className={getLayoutGridClass()}>
                  {catalogMovies
                    .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
                    .map((movie, idx) => (
                      <div key={`cat-${movie.id}-${idx}`} className="flex justify-center w-full">
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          isFavorite={isFavorite(movie.id)}
                          onToggleFavorite={toggleFavorite}
                          onPlay={handlePlayMovie}
                          onOpenDetails={handleOpenDetails}
                          layoutStyle={settings.movieLayout || 'poster'}
                        />
                      </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMoreCatalog && (
                  <div className="text-center mt-10">
                    <button
                      onClick={handleLoadMoreCatalog}
                      disabled={isLoadingCatalog}
                      className="inline-flex items-center gap-2 bg-[#141624] hover:bg-[var(--color-primary)] border border-white/10 hover:border-[var(--color-primary)] text-white text-xs md:text-sm font-bold px-8 py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isLoadingCatalog ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-light)]" />
                          <span>جاري تحميل الصفحة {catalogPage + 1}...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>عرض المزيد من الأفلام (صفحة {catalogPage + 1})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- VIEW: FAVORITES TAB --- */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={savedFavoritesMovies}
            onToggleFavorite={toggleFavorite}
            onClearFavorites={clearAllFavorites}
            onPlayMovie={handlePlayMovie}
            onOpenDetails={handleOpenDetails}
            onExploreMovies={() => setActiveTab('home')}
            layoutStyle={settings.movieLayout || 'poster'}
          />
        )}

        {/* --- VIEW: HISTORY TAB --- */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onRemoveItem={removeHistoryItem}
            onClearHistory={clearAllHistory}
            onPlayMovie={handlePlayMovie}
            onOpenDetails={handleOpenDetails}
            onExploreMovies={() => setActiveTab('home')}
          />
        )}
        {/* --- VIEW: MOVIE DETAIL TAB --- */}
        {activeTab === 'movie-detail' && (
          <MovieDetailView
            movie={selectedMovie}
            onBack={() => {
              setActiveTab(previousTab);
            }}
            isFavorite={selectedMovie ? isFavorite(selectedMovie.id) : false}
            onToggleFavorite={toggleFavorite}
            onSelectSimilarMovie={(sim) => {
              setSelectedMovie(sim);
              setAutoPlayDetail(false);
            }}
            allMovies={allCurrentMovies}
            initialPlay={autoPlayDetail}
          />
        )}

        {/* --- VIEW: SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            settings={settings}
            onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
            onShowToast={addToast}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* --- MODALS & DRAWERS --- */}

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(email, name, avatar) => {
          setUser((prev) => ({
            ...prev,
            email,
            name,
            avatar,
            isLoggedIn: true,
          }));
          addToast('تم بنجاح!', `مرحباً بك، تم تسجيل الدخول بـ ${name}`, 'success');
        }}
      />

      {/* Smart TV Cast Control Modal */}
      {isCastModalOpen && (
        <div id="cast-modal-backdrop" className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Cast className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">طرق البث والعرض المباشر 📺</h3>
                  <p className="text-[10px] text-neutral-400">بث فوري لأي شاشة تلفاز ذكي بأسهل طريقة</p>
                </div>
              </div>
              <button
                onClick={() => setIsCastModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Selector */}
            {!isCasting && (
              <div className="flex bg-[#161a24] p-1 rounded-xl mb-4 shrink-0 border border-white/5">
                <button
                  onClick={() => setCastModalTab('pair')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    castModalTab === 'pair' 
                      ? 'bg-[var(--color-primary)] text-white shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  الاقتران السحابي (QR Code)
                </button>
                <button
                  onClick={() => setCastModalTab('guide')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    castModalTab === 'guide' 
                      ? 'bg-[var(--color-primary)] text-white shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  بث الشاشة المباشر (AirPlay / Cast)
                </button>
              </div>
            )}

            {/* Content Area - Scrollable if content is long */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {isCasting ? (
                /* Already casting state */
                <div className="space-y-6 text-center py-4">
                  <div className="relative inline-block">
                    <div className="absolute -inset-1.5 bg-green-500 rounded-full blur animate-pulse opacity-40"></div>
                    <div className="relative w-16 h-16 rounded-full bg-green-600/15 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                      <Cast className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">متصل وجاهز للبث المباشر</h4>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      أي فيلم أو مسلسل تضغط على زر تشغيله الآن سيتم إرساله فوراً للتلفاز بجودة سينمائية كاملة.
                    </p>
                  </div>

                  {selectedMovie && (
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3 text-right">
                      <img
                        src={selectedMovie.poster}
                        alt={selectedMovie.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-neutral-400 block">يتم بثه حالياً:</span>
                        <span className="text-sm font-bold text-white block truncate">{selectedMovie.title}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => castCommandToTv('stop')}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                    >
                      قطع الاتصال وإنهاء البث
                    </button>
                    <button
                      onClick={() => setIsCastModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      متابعة التصفح
                    </button>
                  </div>
                </div>
              ) : castModalTab === 'pair' ? (
                /* Pairing setup state */
                <div className="space-y-5">
                  <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl text-right space-y-1">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      💡 طريقة الاقتران التلقائي السهلة:
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      افتح الموقع على متصفح التلفاز، واضغط على <span className="font-bold text-white">"شاشة التلفاز 📺"</span> بالأعلى. سيظهر لك <span className="text-amber-400 font-bold">كود QR سريع</span>، قم بمسحه بكاميرا الهاتف ليتم الاقتران تلقائياً وفوراً!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 block text-right">أو أدخل الرمز المكون من 6 أرقام يدوياً:</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={7}
                        value={castPairingCode}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          if (cleaned.length > 3) {
                            setCastPairingCode(`${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`);
                          } else {
                            setCastPairingCode(cleaned);
                          }
                        }}
                        placeholder="مثال: 142 942"
                        className="w-full bg-[#161a24] border border-white/10 rounded-2xl py-3 px-4 text-center font-mono text-2xl font-black tracking-widest text-[var(--color-primary)] placeholder-neutral-600 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 text-right"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => connectAndCastToTv(castPairingCode)}
                    className="w-full py-3.5 theme-btn-gradient text-white font-bold rounded-2xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-red-600/10 cursor-pointer"
                  >
                    تأكيد الاقتران وبدء البث 📺
                  </button>
                </div>
              ) : (
                /* Native Screen Mirroring Guide State */
                <div className="space-y-4 text-right">
                  <div className="bg-green-500/5 border border-green-500/15 p-4 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-green-400">
                      💡 ميزة عرض شاشة الهاتف بالكامل (Screen Mirroring)
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      هذه هي الطريقة الافتراضية والأساسية المدمجة في هاتفك لعرض شاشة هاتفك بالكامل وبث الفيديو فوراً على أي تلفزيون ذكي متصل بنفس شبكة الواي فاي.
                    </p>
                  </div>

                  {/* Guides container */}
                  <div className="space-y-3">
                    {/* iOS Guide */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-white">لأجهزة الأيفون والأيباد (iOS)</span>
                        <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-xs">🍏</div>
                      </div>
                      <ol className="text-xs text-neutral-300 list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>اسحب من أعلى الزاوية اليسرى للشاشة لفتح <span className="text-white font-bold">مركز التحكم</span>.</li>
                        <li>اضغط على زر <span className="text-white font-bold">"انعكاس الشاشة / Screen Mirroring"</span> (أيقونة شاشتين متداخلتين).</li>
                        <li>اختر اسم تلفازك الذكي من القائمة، وستظهر شاشة هاتفك والفيلم فوراً بملء شاشة التلفاز!</li>
                      </ol>
                    </div>

                    {/* Android Guide */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-white">لأجهزة الأندرويد (سامسونج، شاومي، هواوي)</span>
                        <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-xs">🤖</div>
                      </div>
                      <ol className="text-xs text-neutral-300 list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>اسحب لأسفل من أعلى الشاشة لفتح <span className="text-white font-bold">لوحة الاختصارات السريعة</span>.</li>
                        <li>ابحث عن ميزة <span className="text-white font-bold">Smart View</span> أو <span className="text-white font-bold">بث الشاشة (Cast / Screen Share)</span>.</li>
                        <li>اضغط عليها واختر اسم التلفاز، وسيتم بدء البث المباشر الفوري بجودة فائقة!</li>
                      </ol>
                    </div>

                    {/* PC/Mac Web Guide */}
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-white">لأجهزة الكمبيوتر (Chrome / Edge)</span>
                        <div className="w-6 h-6 rounded-lg bg-blue-500/25 flex items-center justify-center text-xs text-blue-400">💻</div>
                      </div>
                      <ol className="text-xs text-neutral-300 list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>اضغط بزر الفأرة الأيمن (Right-click) في أي مكان فارغ بالصفحة.</li>
                        <li>اختر خيار <span className="text-white font-bold">"إرسال... / Cast..."</span> من القائمة.</li>
                        <li>حدد جهاز Chromecast أو التلفزيون الذكي لتشغيل الموقع مباشرة عليه!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Animated Toast System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
