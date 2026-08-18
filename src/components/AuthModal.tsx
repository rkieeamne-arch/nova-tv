import React, { useState, type FormEvent } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Tv, 
  Sparkles,
  Database,
  Copy,
  Check,
  KeyRound,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  isSupabaseConfigured, 
  supabaseSignIn, 
  supabaseSignUp, 
  translateAuthError,
  setCustomSupabaseConfig
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, username: string, avatar: string) => void;
  initialMode?: 'login' | 'signup';
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80', name: 'كلاسيكي' },
  { id: '2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=240&q=80', name: 'أكشن' },
  { id: '3', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80', name: 'دراما' },
  { id: '4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80', name: 'سينما' },
  { id: '5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80', name: 'فانتازيا' },
  { id: '6', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=240&q=80', name: 'غموض' }
];

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0].url);
  const [showPassword, setShowPassword] = useState(false);

  // Manual Keys Inputs
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveKeys = (e: FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      setErrorMessage('يرجى إدخال رابط المشروع والمفتاح المجهول (Anon Key).');
      return;
    }

    try {
      setCustomSupabaseConfig(customUrl.trim(), customKey.trim());
      setSuccessMessage('تم حفظ إعدادات Supabase بنجاح! يمكنك الآن استخدام التسجيل.');
      setShowKeyInput(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorMessage('فشل في حفظ البيانات: ' + err.message);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!email.trim() || !password) {
      setErrorMessage('يرجى ملء كافة الحقول المطلوبة.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await supabaseSignUp(email.trim(), password, username.trim(), avatar);
        setSuccessMessage('تم إنشاء الحساب بنجاح في Supabase!');
        setTimeout(() => {
          onSuccess(
            email.trim(), 
            username.trim(), 
            avatar
          );
          onClose();
        }, 1200);
      } else {
        const result = await supabaseSignIn(email.trim(), password);
        const userObj = result.user;
        const metaUser = userObj?.user_metadata?.username || email.split('@')[0];
        const metaAvatar = userObj?.user_metadata?.avatar_url || avatar;

        setSuccessMessage('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          onSuccess(email.trim(), metaUser, metaAvatar);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copySqlCode = () => {
    const sql = `-- 1. Table schema for profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-[#0d0f17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#121420]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border-subtle border p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Tv className="w-5 h-5 theme-text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                نظام حسابات NOVA TV
                <span className="text-[10px] theme-badge px-2 py-0.5 rounded-full font-mono">
                  Supabase Auth
                </span>
              </h2>
              <p className="text-xs text-neutral-400">سجل حسابك لحفظ المفضلة وسجل المشاهدة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Supabase Environment Notice (if missing) */}
          {!isSupabaseConfigured && (
            <div className="m-4 p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200 text-xs leading-relaxed space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>ربط مشروع Supabase الخاص بك</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showKeyInput ? 'إخفاء الحقول' : 'إدخال المفاتيح هنا مباشرة'}</span>
                </button>
              </div>

              {!showKeyInput ? (
                <>
                  <p>
                    أضف المتغيرات التالية إلى ملف <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-white">.env</code> أو انقر "إدخال المفاتيح هنا مباشرة":
                  </p>
                  <div className="bg-[#05060a] p-2.5 rounded-xl border border-white/10 font-mono text-[11px] text-cyan-300 select-all dir-ltr text-left overflow-x-auto">
                    VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-300">أو نسخ كود SQL لإنشاء جدول Profiles والـ RLS:</span>
                    <button
                      type="button"
                      onClick={copySqlCode}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveKeys} className="space-y-2.5 pt-2 border-t border-amber-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">
                      رابط المشروع (SUPABASE_URL):
                    </label>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full bg-black/60 border border-amber-500/40 rounded-xl p-2.5 text-xs text-white font-mono dir-ltr text-left focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">
                      المفتاح المجهول (SUPABASE_ANON_KEY):
                    </label>
                    <input
                      type="text"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-black/60 border border-amber-500/40 rounded-xl p-2.5 text-xs text-white font-mono dir-ltr text-left focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ المفاتيح وتحديث الاتصال</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab Selection */}
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 bg-[#121420] p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'theme-btn-gradient text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'signup'
                    ? 'theme-btn-gradient text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب جديد</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Username Input (Only for Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  اسم المستخدم / اسم العرض:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: أحمد العلي"
                    className="w-full bg-[#131522] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#131522] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dir-ltr text-right"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131522] border border-white/10 rounded-xl py-3 pr-10 pl-10 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dir-ltr text-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Avatar Selection (Only for Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2">
                  اختر صورتك الشخصية الرمزية:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.url)}
                      className={`p-0.5 rounded-xl border transition-all cursor-pointer relative ${
                        avatar === av.url
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40 scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-10 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 theme-btn-gradient text-white rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري معالجة الطلب...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول الحساب</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب الآن</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a0c12] border-t border-white/5 text-center text-xs text-neutral-400 flex items-center justify-center gap-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>تخزين مشفّر وآمن عبر Supabase Auth & RLS</span>
        </div>
      </motion.div>
    </div>
  );
}
