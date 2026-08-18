import React, { useState, type FormEvent, useRef, useEffect } from 'react';
import { 
  User, 
  Palette, 
  Check, 
  LogOut, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Sliders, 
  Type, 
  LayoutGrid, 
  Tv, 
  Camera, 
  CheckCircle2, 
  Star,
  Film,
  Heart,
  Eye,
  Play,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AppSettings } from '../types';
import { supabaseSignOut, supabaseUpdateProfile, isSupabaseConfigured } from '../lib/supabase';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'horror' | 'info' | 'warning') => void;
  onOpenAuthModal?: () => void;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80', name: 'كلاسيكي' },
  { id: '2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=240&q=80', name: 'أكشن' },
  { id: '3', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80', name: 'دراما' },
  { id: '4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80', name: 'سينما' },
  { id: '5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80', name: 'فانتازيا' },
  { id: '6', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=240&q=80', name: 'غموض' }
];

const THEME_OPTIONS = [
  { 
    id: 'red', 
    name: 'أحمر سينمائي', 
    subtitle: 'طابع نيتفليكس الكلاسيكي',
    colorHex: '#dc2626',
    borderClass: 'border-red-500',
    bgClass: 'bg-red-600',
    glowClass: 'shadow-[0_0_20px_rgba(220,38,38,0.4)]',
    textClass: 'text-red-500'
  },
  { 
    id: 'blue', 
    name: 'أزرق محيطي', 
    subtitle: 'هادئ ومريح للعين',
    colorHex: '#2563eb',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-600',
    glowClass: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
    textClass: 'text-blue-500'
  },
  { 
    id: 'green', 
    name: 'أخضر زمردي', 
    subtitle: 'أنيق وحيوي',
    colorHex: '#059669',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-600',
    glowClass: 'shadow-[0_0_20px_rgba(5,150,105,0.4)]',
    textClass: 'text-emerald-500'
  },
  { 
    id: 'amber', 
    name: 'ذهبي بريميوم', 
    subtitle: 'طابع VIP وسينمائي فخم',
    colorHex: '#d97706',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500',
    glowClass: 'shadow-[0_0_20px_rgba(217,119,6,0.4)]',
    textClass: 'text-amber-400'
  },
  { 
    id: 'purple', 
    name: 'بنفسجي ملكي', 
    subtitle: 'غامض ومميز',
    colorHex: '#9333ea',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-600',
    glowClass: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]',
    textClass: 'text-purple-500'
  },
] as const;

const FONT_OPTIONS = [
  { 
    id: 'cairo', 
    name: 'Cairo (كايرو)', 
    styleClass: "font-cairo",
    fontFamily: "'Cairo', sans-serif",
    desc: 'الخط السينمائي العصري المعتمد'
  },
  { 
    id: 'tajawal', 
    name: 'Tajawal (تجوّل)', 
    styleClass: "font-tajawal",
    fontFamily: "'Tajawal', sans-serif",
    desc: 'خط عصري انسيابي وسهل القراءة'
  },
  { 
    id: 'almarai', 
    name: 'Almarai (المراعي)', 
    styleClass: "font-almarai",
    fontFamily: "'Almarai', sans-serif",
    desc: 'خط عربي كلاسيكي أنيق وفائق الوضوح'
  },
  { 
    id: 'readex', 
    name: 'Readex Pro (ريديكس)', 
    styleClass: "font-readex",
    fontFamily: "'Readex Pro', sans-serif",
    desc: 'تصميم هندسي حديث ومريح للشاشات'
  },
] as const;

const LAYOUT_OPTIONS = [
  { 
    id: 'poster', 
    title: 'ملصق طولي (Poster)', 
    badge: 'الافتراضي',
    desc: 'العرض السينمائي الكلاسيكي مع بروز تفاصيل الغلاف والتقييمات',
    previewType: 'poster'
  },
  { 
    id: 'backdrop', 
    title: 'خلفية عريضة (Backdrop)', 
    badge: 'سينما 16:9',
    desc: 'لقطات عريضة غامرة تبرز جمال المشاهد والمؤثرات',
    previewType: 'backdrop'
  },
  { 
    id: 'compact', 
    title: 'شبكة مصغرة (Compact)', 
    badge: 'تصفح سريع',
    desc: 'كثافة عالية لعرض أكبر قدر من الأفلام في الشاشة',
    previewType: 'compact'
  },
] as const;

export function SettingsView({
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  onShowToast,
  onOpenAuthModal,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'customization'>('profile');
  
  // Local state for profile form
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(user.name);
    setEmailInput(user.email);
  }, [user.name, user.email]);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSaving(true);
    try {
      if (user.isLoggedIn && user.id) {
        await supabaseUpdateProfile(user.id, {
          username: nameInput.trim(),
          avatar_url: user.avatar,
        });
      }
      onUpdateUser({
        name: nameInput.trim(),
        email: emailInput.trim() || user.email,
        isLoggedIn: true,
      });
      onShowToast('تم حفظ الحساب بنجاح', `تم تحديث بياناتك يا ${nameInput.trim()}`, 'success');
    } catch (err: any) {
      onShowToast('خطأ في حفظ الحساب', err.message || 'تعذر تحديث البيانات', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseSignOut();
    } catch {
      // Ignore if offline
    }
    onUpdateUser({
      id: '',
      name: 'زائر',
      email: 'guest@novatv.app',
      isLoggedIn: false,
      isVip: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
    setNameInput('زائر');
    setEmailInput('guest@novatv.app');
    onShowToast('تم تسجيل الخروج', 'أنت الآن تتصفح الحساب كزائر', 'info');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        onShowToast('حجم الملف كبير', 'يرجى اختيار صورة بحجم أقل من 3 ميغابايت', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onUpdateUser({ avatar: result });
        onShowToast('تم تحديث الصورة', 'تم تغيير صورتك الشخصية بنجاح من جهازك', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const activeThemeColor = settings?.themeColor || 'red';
  const currentTheme = THEME_OPTIONS.find(t => t.id === activeThemeColor) || THEME_OPTIONS[0];
  const activeFontFamily = settings?.fontFamily || 'cairo';
  const currentFont = FONT_OPTIONS.find(f => f.id === activeFontFamily) || FONT_OPTIONS[0];
  const activeMovieLayout = settings?.movieLayout || 'poster';

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6 text-right">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl theme-bg-subtle theme-border-subtle border p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#0c0e15] rounded-[14px] flex items-center justify-center">
              <Sliders className="w-7 h-7 theme-text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              مركز الإعدادات
              <span className="text-xs font-normal theme-badge px-2.5 py-1 rounded-full">
                NOVA TV Studio
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              التحكم في بيانات الحساب، الصورة الشخصية، وتخصيص المظهر والخطوط والألوان
            </p>
          </div>
        </div>

        {/* User Mini Status Chip */}
        <div className="flex items-center gap-3 bg-[#11131c] border border-white/10 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-inner">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            {user.isVip && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <Crown className="w-2.5 h-2.5 text-black" />
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{user.name}</span>
              {user.isLoggedIn && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <span className="text-[11px] text-neutral-400 block font-mono">
              {user.isLoggedIn ? user.email : 'حساب زائر'}
            </span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SIDE-BY-SIDE TAB NAVIGATION BAR */}
      <div className="relative bg-[#0d0f17] p-1.5 rounded-2xl border border-white/10 mb-8 max-w-xl mx-auto shadow-xl">
        <div className="grid grid-cols-2 gap-2 relative z-10">
          
          {/* Tab 1: Profile & Account */}
          <button
            type="button"
            id="tab-btn-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === 'profile'
                ? 'theme-btn-primary shadow-lg'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-neutral-400'}`} />
            <span>الحساب والملف الشخصي</span>
          </button>

          {/* Tab 2: Customization & Appearance */}
          <button
            type="button"
            id="tab-btn-customization"
            onClick={() => setActiveTab('customization')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === 'customization'
                ? 'theme-btn-primary shadow-lg'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className={`w-4 h-4 ${activeTab === 'customization' ? 'text-white' : 'text-neutral-400'}`} />
            <span>التخصيص والمظهر</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </button>

        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="tab-profile-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Guest Login Callout Banner */}
            {!user.isLoggedIn && (
              <div className="bg-gradient-to-r from-[#171a29] via-[#1f2238] to-[#171a29] border border-[var(--color-primary)]/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl theme-btn-gradient flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Sparkles className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">أنت تتصفح كزائر حالياً</h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      قم بتسجيل الدخول أو إنشاء حساب عبر Supabase Auth لحفظ مفضلتك وسجل مشاهداتك مزامنتها على كافة أجهزتك.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-6 py-3 theme-btn-gradient text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-lg hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول / حساب جديد</span>
                </button>
              </div>
            )}

            {/* PROFILE SECTION: 2 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Form details */}
              <div className="lg:col-span-2 bg-[#0f111a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">بيانات الحساب الشخصي</h3>
                    <p className="text-xs text-neutral-400">قم بتعديل اسم العرض والبريد الإلكتروني لحفظ مفضلتك وسجلك</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      اسم العرض (الاسم المستعار):
                    </label>
                    <input
                      type="text"
                      id="profile-name-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="أدخل اسمك..."
                      className="w-full bg-[#08090e] border border-white/10 focus:border-[var(--color-primary)] text-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      البريد الإلكتروني:
                    </label>
                    <input
                      type="email"
                      id="profile-email-input"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-[#08090e] border border-white/10 focus:border-[var(--color-primary)] text-white text-sm px-4 py-3.5 rounded-xl outline-none transition-all font-mono"
                    />
                  </div>

                  {/* VIP toggle / badge */}
                  <div className="bg-[#141624] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          عضوية بريميوم VIP السينمائية
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                            نشط
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          تمنحك وصولاً غير محدود لجميع سيرفرات 4K والأفلام الحصرية
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateUser({ isVip: !user.isVip });
                        onShowToast(
                          user.isVip ? 'تم إيقاف VIP' : 'تم تفعيل عضوية VIP',
                          user.isVip ? 'تم التحويل لحساب قياسي' : 'استمتع بميزات السينما الممتازة',
                          'success'
                        );
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        user.isVip
                          ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {user.isVip ? 'مفعل ✓' : 'تفعيل'}
                    </button>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="save-profile-btn"
                      disabled={isSaving}
                      className="w-full py-3.5 px-6 theme-btn-gradient text-white rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>حفظ تعديلات الحساب</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Avatar Selection & Logout */}
              <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">الصورة الرمزية</h3>
                      <p className="text-xs text-neutral-400">اختر أفتار سينمائي أو ارفع صورتك الخاصة</p>
                    </div>
                  </div>

                  {/* Current Active Avatar Preview */}
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className="relative group">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-3xl object-cover border-2 border-[var(--color-primary)] shadow-[0_0_25px_var(--color-glow)] transition-all group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs transition-opacity cursor-pointer"
                        title="تغيير الصورة من الجهاز"
                      >
                        <Upload className="w-5 h-5 mb-1" />
                        <span>رفع صورة</span>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك</span>
                    </button>
                  </div>

                  {/* Preset Avatars Grid */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-3">
                      أو اختر من الأيقونات الجاهزة:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AVATARS.map((av) => {
                        const isSelected = user.avatar === av.url;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => {
                              onUpdateUser({ avatar: av.url });
                              onShowToast('تم تحديث الصورة', `تم تعيين أفتار ${av.name}`, 'success');
                            }}
                            className={`p-1 rounded-2xl border transition-all cursor-pointer relative group ${
                              isSelected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15 shadow-[0_0_15px_var(--color-glow)] scale-105'
                                : 'border-white/10 hover:border-white/30 bg-[#08090e]'
                            }`}
                          >
                            <img
                              src={av.url}
                              alt={av.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-14 rounded-xl object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <span className="text-[10px] text-neutral-400 block text-center mt-1 truncate">
                              {av.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 px-4 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج / تصفح كزائر</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab-customization-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* CUSTOMIZATION SECTION 1: Theme Palette */}
            <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border-subtle border flex items-center justify-center theme-text-primary">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">سمة ولون التطبيق (Theme Palette)</h3>
                  <p className="text-xs text-neutral-400">حدد اللون الرئيسي للأزرار، التوهجات، واللمسات الجمالية في الموقع.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = activeThemeColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ themeColor: theme.id as AppSettings['themeColor'] });
                        // Also apply directly to DOM
                        document.documentElement.setAttribute('data-theme', theme.id);
                        document.body.setAttribute('data-theme', theme.id);
                        onShowToast('تم تحديث السمة', `تم تطبيق نمط ${theme.name}`, 'success');
                      }}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? `bg-[#141624] ${theme.borderClass} ${theme.glowClass} ring-2 ring-offset-2 ring-offset-[#0f111a] ring-white/20`
                          : 'bg-[#090b12] border-white/10 hover:border-white/20 hover:bg-[#11131e]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-full ${theme.bgClass} flex items-center justify-center shadow-md`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.colorHex }} />
                      </div>

                      <div className="text-sm font-bold text-white">{theme.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{theme.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMIZATION SECTION 2: Arabic Typography */}
            <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">نوع الخط العربي (Typography)</h3>
                  <p className="text-xs text-neutral-400">اختر الخط المفضل لعناوين الأفلام ونصوص الموقع.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {FONT_OPTIONS.map((font) => {
                  const isSelected = activeFontFamily === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ fontFamily: font.id as AppSettings['fontFamily'] });
                        // Also apply directly to DOM
                        document.documentElement.setAttribute('data-font', font.id);
                        document.body.setAttribute('data-font', font.id);
                        onShowToast('تم تغيير الخط', `تم تفعيل خط ${font.name}`, 'success');
                      }}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#141624] border-[var(--color-primary)] shadow-[0_0_20px_var(--color-glow)] ring-2 ring-[var(--color-primary)]/30'
                          : 'bg-[#090b12] border-white/10 hover:border-white/20 hover:bg-[#11131e]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-300">{font.name}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full theme-btn-primary flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>

                      <div 
                        className="text-xl font-bold text-white my-3"
                        style={{ fontFamily: font.fontFamily }}
                      >
                        تجربة سينمائية فريدة
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {font.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMIZATION SECTION 3: Movie Display Layout */}
            <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">طريقة عرض الأعمال والأفلام (Card Layout)</h3>
                  <p className="text-xs text-neutral-400">تحكم في التنسيق البصري لبطاقات الأفلام عبر الموقع.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {LAYOUT_OPTIONS.map((layout) => {
                  const isSelected = activeMovieLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ movieLayout: layout.id as AppSettings['movieLayout'] });
                        onShowToast('تم تحديث العرض', `تم اختيار نمط ${layout.title}`, 'success');
                      }}
                      className={`p-5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#141624] border-[var(--color-primary)] shadow-[0_0_20px_var(--color-glow)] ring-2 ring-[var(--color-primary)]/30'
                          : 'bg-[#090b12] border-white/10 hover:border-white/20 hover:bg-[#11131e]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 font-medium text-neutral-300">
                            {layout.badge}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full theme-btn-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </div>

                        {/* Mini Graphic Mockup */}
                        <div className="h-24 bg-[#080a0f] rounded-xl border border-white/10 p-2.5 mb-4 flex items-center justify-center overflow-hidden">
                          {layout.id === 'poster' && (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-18 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/60 rounded-lg flex flex-col justify-end p-1 shadow-md">
                                <div className="w-full h-1 bg-[var(--color-primary)] rounded" />
                              </div>
                              <div className="w-12 h-18 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-end p-1">
                                <div className="w-full h-1 bg-white/20 rounded" />
                              </div>
                              <div className="w-12 h-18 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-end p-1">
                                <div className="w-full h-1 bg-white/20 rounded" />
                              </div>
                            </div>
                          )}

                          {layout.id === 'backdrop' && (
                            <div className="flex flex-col gap-1.5 w-full">
                              <div className="w-full h-10 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/60 rounded-lg flex items-center px-2 shadow-md">
                                <div className="w-8 h-1 bg-[var(--color-primary)] rounded" />
                              </div>
                              <div className="w-full h-8 bg-white/5 border border-white/10 rounded-lg" />
                            </div>
                          )}

                          {layout.id === 'compact' && (
                            <div className="grid grid-cols-4 gap-1.5 w-full">
                              <div className="h-14 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/60 rounded-md shadow-md" />
                              <div className="h-14 bg-white/5 border border-white/10 rounded-md" />
                              <div className="h-14 bg-white/5 border border-white/10 rounded-md" />
                              <div className="h-14 bg-white/5 border border-white/10 rounded-md" />
                            </div>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white mb-1">{layout.title}</h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {layout.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIVE REALTIME PREVIEW SHOWCASE CARD */}
            <div className="bg-gradient-to-r from-[#12141f] via-[#161926] to-[#12141f] border border-white/15 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-4">
                <Eye className="w-4 h-4 theme-text-primary" />
                <span>معاينة حية لاختياراتك الحالية (Live Preview):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#090b10] p-5 rounded-2xl border border-white/10 items-center">
                {/* Info side */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${currentTheme.bgClass} flex items-center justify-center text-white font-bold shadow-md`}>
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        الخط: <span className="theme-text-light">{currentFont.name}</span> • اللون: <span style={{ color: currentTheme.colorHex }}>{currentTheme.name}</span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        طريقة العرض: {activeMovieLayout === 'poster' ? 'ملصق طولي (Poster)' : activeMovieLayout === 'backdrop' ? 'خلفية عريضة (Backdrop)' : 'شبكة مصغرة (Compact)'}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed" style={{ fontFamily: currentFont.fontFamily }}>
                    هذا النص يُظهر الخط المختار «{currentFont.name}» مع اللون المميز والتأثيرات البصرية المتناسقة.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>زر تجريبي</span>
                    </button>
                    <span className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-emerald-400 font-bold">
                      ✓ يُحفظ تلقائياً في المتصفح
                    </span>
                  </div>
                </div>

                {/* Mini Live Card Mockup */}
                <div className="flex justify-center items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <div 
                    className="relative overflow-hidden rounded-xl border border-[var(--color-primary)] bg-[#12131a] shadow-[0_0_20px_var(--color-glow)] transition-all"
                    style={{ 
                      width: activeMovieLayout === 'backdrop' ? '280px' : activeMovieLayout === 'compact' ? '120px' : '160px',
                      aspectRatio: activeMovieLayout === 'backdrop' ? '16/9' : activeMovieLayout === 'compact' ? '3/4' : '2/3',
                      fontFamily: currentFont.fontFamily
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80"
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-amber-400 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> 9.2
                      </span>
                      <span className="w-6 h-6 rounded-full theme-btn-primary flex items-center justify-center">
                        <Heart className="w-3 h-3 fill-white text-white" />
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <h5 className="text-xs font-bold text-white truncate">فيلم السهرة التجريبي</h5>
                      <span className="text-[10px] theme-text-light block">NOVA Original • 2025</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
