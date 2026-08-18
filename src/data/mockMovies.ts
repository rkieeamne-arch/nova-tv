import { UserProfile, AppSettings } from '../types';

export const DEFAULT_USER: UserProfile = {
  id: 'guest',
  name: 'زائر',
  email: 'guest@novatv.app',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  isLoggedIn: false,
  isVip: false,
  plan: 'مجانية',
  joinedDate: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeColor: 'red',
  fontFamily: 'cairo',
  movieLayout: 'poster'
};

export const SAMPLE_MOVIES_CATALOG = [];
