import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// Check env first, then localStorage for instant UI configuration
const envUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const envKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('nova_supabase_url') || '').trim() : '';
const localKey = typeof window !== 'undefined' ? (localStorage.getItem('nova_supabase_key') || '').trim() : '';

const activeUrl = envUrl || localUrl;
const activeKey = envKey || localKey;

export const isSupabaseConfigured = Boolean(
  activeUrl &&
  activeKey &&
  activeUrl !== 'https://your-supabase-project.supabase.co' &&
  activeUrl !== 'MY_SUPABASE_URL' &&
  activeUrl.startsWith('http')
);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(activeUrl, activeKey)
  : null;

export function setCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('nova_supabase_url', url.trim());
      localStorage.setItem('nova_supabase_key', key.trim());
      supabase = createClient(url.trim(), key.trim());
    } else {
      localStorage.removeItem('nova_supabase_url');
      localStorage.removeItem('nova_supabase_key');
      supabase = envUrl && envKey ? createClient(envUrl, envKey) : null;
    }
  }
}

export interface ProfileRecord {
  id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Translates Supabase authentication and database errors into user-friendly Arabic messages.
 */
export function translateAuthError(error: any): string {
  if (!error) return 'حدث خطأ غير متوقع أثناء الاتصال.';
  const message = typeof error === 'string' ? error : error.message || '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'كلمة المرور أو البريد الإلكتروني غير صحيح. يرجى إعادة المحاولة.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('email rate limit exceeded')) {
    return 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.';
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'عنوان البريد الإلكتروني غير صالحة. يرجى إدخال بريد صحيح.';
  }
  if (lower.includes('password should be at least 6 characters')) {
    return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.';
  }
  if (lower.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك.';
  }
  if (lower.includes('user not found')) {
    return 'الحساب غير موجود. يرجى إنشاء حساب جديد.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'تعذر الاتصال بالسيرفر. يرجى التحقق من الاتصال بالإنترنت.';
  }

  return message || 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
}

/**
 * Sign up a new user with Email, Password and Username
 */
export async function supabaseSignUp(email: string, pass: string, username: string, avatarUrl?: string) {
  if (!supabase) {
    throw new Error('Supabase غير مهيأ بعد. يرجى إضافة متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY');
  }

  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        username: username.trim(),
        avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      },
    },
  });

  if (error) {
    throw new Error(translateAuthError(error));
  }

  // Insert or upsert into profiles table
  if (data.user) {
    const defaultAvatar = avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80';
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: username.trim() || email.split('@')[0],
          avatar_url: defaultAvatar,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    } catch {
      // Profile creation handled by DB trigger if configured
    }
  }

  return data;
}

/**
 * Sign in an existing user with Email and Password
 */
export async function supabaseSignIn(email: string, pass: string) {
  if (!supabase) {
    throw new Error('Supabase غير مهيأ بعد. يرجى إضافة متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    throw new Error(translateAuthError(error));
  }

  return data;
}

/**
 * Sign out the current session
 */
export async function supabaseSignOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(translateAuthError(error));
  }
}

/**
 * Get profile record from public.profiles table
 */
export async function supabaseGetProfile(userId: string): Promise<ProfileRecord | null> {
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile:', error.message);
      return null;
    }

    return data as ProfileRecord | null;
  } catch {
    return null;
  }
}

/**
 * Update user profile in public.profiles table
 */
export async function supabaseUpdateProfile(userId: string, updates: Partial<ProfileRecord>) {
  if (!supabase || !userId) return;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
    });

  if (error) {
    throw new Error(translateAuthError(error));
  }

  return data;
}
