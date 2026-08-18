import type { ReactNode } from 'react';
import { 
  Tv, 
  Film, 
  Heart, 
  History, 
  Settings, 
  Search, 
  Crown, 
  SlidersHorizontal, 
  X, 
  Menu, 
  Sparkles,
  Cast
} from 'lucide-react';
import { MainViewTab, UserProfile, AppSettings } from '../types';

interface NavbarProps {
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
  favoritesCount: number;
  historyCount: number;
  user: UserProfile;
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReplayIntro?: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  onOpenAuthModal?: () => void;
  isCasting: boolean;
  onOpenCastModal: () => void;
  onOpenTvReceiver: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  favoritesCount,
  historyCount,
  user,
  settings,
  searchQuery,
  onSearchChange,
  onReplayIntro,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onOpenAuthModal,
  isCasting,
  onOpenCastModal,
  onOpenTvReceiver,
}: NavbarProps) {
  return (
    <>
      {/* PC / DESKTOP SIDEBAR */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:flex flex-col fixed top-0 right-0 h-screen z-40 bg-[#090b10]/95 backdrop-blur-2xl border-l border-white/5 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div 
            id="brand-logo-btn" 
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border-subtle border p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Tv className="w-5 h-5 theme-text-primary transition-colors" />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <span className="font-['Outfit'] font-black text-xl tracking-wider text-white flex items-center gap-1">
                  NOVA<span className="theme-text-primary">TV</span>
                </span>
                <span className="text-[10px] text-neutral-400 block -mt-1 font-medium">المنصة السينمائية الفائقة</span>
              </div>
            )}
          </div>

          <button
            id="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <SlidersHorizontal className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          <NavItem
            id="nav-home"
            icon={<Tv className="w-5 h-5" />}
            label="الرئيسية"
            active={activeTab === 'home'}
            collapsed={isSidebarCollapsed}
            onClick={() => onTabChange('home')}
          />

          <NavItem
            id="nav-movies"
            icon={<Film className="w-5 h-5 text-amber-400" />}
            label="مكتبة الأفلام"
            active={activeTab === 'movies'}
            collapsed={isSidebarCollapsed}
            onClick={() => onTabChange('movies')}
          />

          <div className="my-4 border-t border-white/5 mx-2" />

          <NavItem
            id="nav-favorites"
            icon={<Heart className="w-5 h-5 text-rose-500" />}
            label="أفلامي المفضلة"
            active={activeTab === 'favorites'}
            collapsed={isSidebarCollapsed}
            onClick={() => onTabChange('favorites')}
            count={favoritesCount}
          />

          <NavItem
            id="nav-history"
            icon={<History className="w-5 h-5 text-cyan-400" />}
            label="سجل المشاهدة"
            active={activeTab === 'history'}
            collapsed={isSidebarCollapsed}
            onClick={() => onTabChange('history')}
            count={historyCount}
          />

          {onReplayIntro && (
            <div className="pt-4">
              <button
                id="replay-intro-sidebar-btn"
                onClick={onReplayIntro}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="مشاهدة المقدمة السينمائية"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                {!isSidebarCollapsed && <span>المقدمة السينمائية</span>}
              </button>
            </div>
          )}
        </nav>

        {/* User Card & Settings in Desktop Sidebar */}
        <div className="p-3 border-t border-white/5 bg-[#07080c]/80">
          <button
            id="sidebar-profile-btn"
            onClick={() => onTabChange('settings')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-right group cursor-pointer"
          >
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-white/10 ring-2 ring-red-600/30"
              />
              {user.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full p-0.5 shadow-sm">
                  <Crown className="w-2.5 h-2.5 text-black" />
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                </div>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Settings className="w-3 h-3 text-neutral-500" /> الحساب والإعدادات
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* TOP DESKTOP HEADER */}
      <header
        id="desktop-top-header"
        className={`hidden md:flex items-center justify-between fixed top-0 left-0 h-20 z-30 bg-gradient-to-b from-[#07080c]/95 via-[#07080c]/80 to-transparent backdrop-blur-md px-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'right-20' : 'right-64'
        }`}
      >
        {/* Search input */}
        <div className="relative w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="desktop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim() && activeTab !== 'search') {
                  onTabChange('search');
                }
              }}
              onFocus={() => {
                if (activeTab !== 'search') onTabChange('search');
              }}
              placeholder="ابحث عن أفلام، مسلسلات، ممثلين..."
              className="w-full bg-[#12141d]/80 border border-white/10 rounded-full py-2.5 pr-10 pl-9 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600/60 focus:ring-2 focus:ring-red-600/20 transition-all"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => {
                  onSearchChange('');
                  if (activeTab === 'search') onTabChange('home');
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => onTabChange('search')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all cursor-pointer shadow-lg shrink-0 ${
              activeTab === 'search'
                ? 'theme-btn-gradient border-[var(--color-primary)]'
                : 'bg-[#1a1c26] hover:bg-white/10 text-white border-white/20 hover:border-[var(--color-primary)]/50'
            }`}
          >
            <span className="text-sm font-bold tracking-wide">بحث مباشر</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {user.isLoggedIn ? (
            <button
              onClick={() => onTabChange('settings')}
              className="flex items-center gap-2.5 bg-[#12141d]/80 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
              <span className="text-xs font-bold text-white truncate max-w-[100px]">{user.name}</span>
            </button>
          ) : (
            <button
              id="top-auth-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 theme-btn-gradient text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Smart TV Cast & Receiver Buttons */}
          <button
            id="top-tv-receiver-btn"
            onClick={onOpenTvReceiver}
            className="flex items-center gap-2 bg-[#12141d]/80 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-medium px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            title="حول هذا المتصفح إلى شاشة استقبال تلفاز ذكي"
          >
            <Tv className="w-4 h-4 text-amber-500" />
            <span>شاشة التلفاز 📺</span>
          </button>

          <button
            id="top-cast-btn"
            onClick={onOpenCastModal}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-full transition-all hover:scale-105 cursor-pointer text-xs font-bold ${
              isCasting 
                ? 'bg-green-600/10 hover:bg-green-600/20 text-green-400 border-green-500/30' 
                : 'bg-[#12141d]/80 hover:bg-white/10 text-neutral-200 border-white/10'
            }`}
            title={isCasting ? 'متصل بالتلفاز - انقر للتحكم' : 'بث لشاشة التلفاز الذكي'}
          >
            <Cast className={`w-4 h-4 ${isCasting ? 'animate-pulse text-green-400' : 'theme-text-primary'}`} />
            <span>{isCasting ? 'بث نشط' : 'بث للتلفاز'}</span>
            {isCasting && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
          </button>

          <button
            id="top-settings-btn"
            onClick={() => onTabChange('settings')}
            className="flex items-center gap-2 bg-[#12141d]/80 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-medium px-4 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 theme-text-primary" />
            <span>الإعدادات</span>
          </button>
        </div>
      </header>

      {/* MOBILE TOP HEADER */}
      <header
        id="mobile-top-header"
        className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#07080c]/95 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4"
      >
        <div 
          id="mobile-logo" 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg theme-bg-subtle theme-border-subtle border p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[6px] flex items-center justify-center">
              <Tv className="w-4 h-4 theme-text-primary" />
            </div>
          </div>
          <span className="font-['Outfit'] font-extrabold text-lg text-white">
            NOVA<span className="theme-text-primary">TV</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!user.isLoggedIn && (
            <button
              id="mobile-auth-btn"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 theme-btn-gradient text-white text-xs font-bold rounded-full cursor-pointer shadow-md"
            >
              دخول
            </button>
          )}

          {/* Mobile Search Button */}
          <button
            id="mobile-search-toggle-btn"
            onClick={() => onTabChange('search')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-lg ${
              activeTab === 'search' 
                ? 'theme-btn-gradient border-[var(--color-primary)]' 
                : 'bg-[#1a1c26] hover:bg-white/10 text-white border-white/20'
            }`}
            aria-label="البحث المباشر"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">بحث</span>
          </button>

          {/* Mobile Cast Button */}
          <button
            id="mobile-cast-btn"
            onClick={onOpenCastModal}
            className={`p-2 rounded-full border transition-all cursor-pointer shadow-md ${
              isCasting
                ? 'bg-green-600/20 text-green-400 border-green-500/40 animate-pulse'
                : 'bg-[#1a1c26] text-neutral-300 border-white/10'
            }`}
            title="بث شاشة مع تلفاز"
          >
            <Cast className="w-5 h-5" />
          </button>

          <button
            id="mobile-settings-btn"
            onClick={() => onTabChange('settings')}
            className={`p-2 rounded-full border transition-all cursor-pointer shadow-md ${
              activeTab === 'settings'
                ? 'theme-btn-gradient border-[var(--color-primary)] text-white shadow-[0_0_12px_var(--color-glow)]'
                : 'bg-[#1a1c26] text-neutral-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            aria-label="الإعدادات"
            title="الإعدادات والتخصيص"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08090f]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2"
      >
        <MobileNavItem
          id="mob-nav-home"
          icon={<Tv className="w-5 h-5" />}
          label="الرئيسية"
          active={activeTab === 'home'}
          onClick={() => onTabChange('home')}
        />
        <MobileNavItem
          id="mob-nav-movies"
          icon={<Film className="w-5 h-5" />}
          label="الأفلام"
          active={activeTab === 'movies'}
          onClick={() => onTabChange('movies')}
          color="text-amber-400"
        />
        <MobileNavItem
          id="mob-nav-fav"
          icon={<Heart className="w-5 h-5" />}
          label="المفضلة"
          active={activeTab === 'favorites'}
          onClick={() => onTabChange('favorites')}
          count={favoritesCount}
          color="text-rose-500"
        />
        <MobileNavItem
          id="mob-nav-history"
          icon={<History className="w-5 h-5" />}
          label="السجل"
          active={activeTab === 'history'}
          onClick={() => onTabChange('history')}
          count={historyCount}
          color="text-cyan-400"
        />
      </nav>
    </>
  );
}

interface NavItemProps {
  id: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  count?: number;
  badge?: string;
  badgeColor?: string;
}

function NavItem({ id, icon, label, active, collapsed, onClick, count, badge, badgeColor }: NavItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
        active
          ? 'theme-active-tab font-semibold shadow-inner'
          : 'text-neutral-400 hover:text-white hover:bg-white/5'
      }`}
      title={label}
    >
      <div className={`shrink-0 transition-transform group-hover:scale-110 ${active ? 'theme-text-primary' : ''}`}>
        {icon}
      </div>
      {!collapsed && (
        <div className="flex-1 flex items-center justify-between text-right">
          <span className="truncate">{label}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs theme-bg-subtle theme-text-primary px-2 py-0.5 rounded-full font-mono font-bold border theme-border-subtle">
              {count}
            </span>
          )}
          {badge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badgeColor || 'theme-bg-subtle theme-text-primary theme-border-subtle'}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

interface MobileNavItemProps {
  id: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  color?: string;
}

function MobileNavItem({ id, icon, label, active, onClick, count, color }: MobileNavItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors cursor-pointer ${
        active ? 'theme-text-primary' : 'text-neutral-400'
      }`}
    >
      <div className="relative">
        {icon}
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1.5 -right-2 theme-btn-primary text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 text-center">
            {count}
          </span>
        )}
      </div>
      <span className={`text-[10px] mt-0.5 font-medium ${active ? 'font-bold' : ''}`}>
        {label}
      </span>
      {active && (
        <span className="w-4 h-0.5 bg-[var(--color-primary)] rounded-full mt-0.5 shadow-[0_0_8px_var(--color-glow)]" />
      )}
    </button>
  );
}
