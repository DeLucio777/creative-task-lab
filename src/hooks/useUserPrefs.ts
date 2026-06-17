import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPrefs {
  confettiEnabled: boolean;
  background: string; // id из BACKGROUND_PRESETS
}

export const BACKGROUND_PRESETS: { id: string; label: string; css: string; preview: string }[] = [
  { id: 'default', label: 'По умолчанию', css: '', preview: 'hsl(40 50% 97%)' },
  { id: 'sky', label: 'Небо', css: 'linear-gradient(180deg, #cfe9ff 0%, #eaf6ff 100%)', preview: 'linear-gradient(180deg, #cfe9ff 0%, #eaf6ff 100%)' },
  { id: 'mint', label: 'Мята', css: 'linear-gradient(180deg, #d6f5e3 0%, #f0fbf5 100%)', preview: 'linear-gradient(180deg, #d6f5e3 0%, #f0fbf5 100%)' },
  { id: 'peach', label: 'Персик', css: 'linear-gradient(180deg, #ffe2d1 0%, #fff5ee 100%)', preview: 'linear-gradient(180deg, #ffe2d1 0%, #fff5ee 100%)' },
  { id: 'lavender', label: 'Лаванда', css: 'linear-gradient(180deg, #e3dcff 0%, #f4f0ff 100%)', preview: 'linear-gradient(180deg, #e3dcff 0%, #f4f0ff 100%)' },
  { id: 'sunny', label: 'Солнечный', css: 'linear-gradient(180deg, #fff3b0 0%, #fffbe6 100%)', preview: 'linear-gradient(180deg, #fff3b0 0%, #fffbe6 100%)' },
  { id: 'stars', label: 'Звёзды', css: "radial-gradient(circle at 20% 30%, #ffffff 1px, transparent 2px) 0 0/40px 40px, radial-gradient(circle at 70% 70%, #ffffff 1px, transparent 2px) 0 0/60px 60px, linear-gradient(180deg, #1b2a4e 0%, #2c3e74 100%)", preview: 'linear-gradient(180deg, #1b2a4e 0%, #2c3e74 100%)' },
];

const DEFAULT_PREFS: UserPrefs = { confettiEnabled: true, background: 'default' };

const keyFor = (uid: number | string) => `userPrefs:${uid}`;

export function readPrefs(uid: number | string | undefined | null): UserPrefs {
  if (uid == null) return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(keyFor(uid));
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useUserPrefs() {
  const { user } = useAuth();
  const uid = user?.PK_UserId;
  const [prefs, setPrefsState] = useState<UserPrefs>(() => readPrefs(uid));

  useEffect(() => {
    setPrefsState(readPrefs(uid));
  }, [uid]);

  // sync between tabs / other hook instances
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (uid != null && e.key === keyFor(uid)) setPrefsState(readPrefs(uid));
    };
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<{ uid: number | string }>;
      if (uid != null && ce.detail?.uid === uid) setPrefsState(readPrefs(uid));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('userPrefsChanged', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userPrefsChanged', onCustom as EventListener);
    };
  }, [uid]);

  const setPrefs = useCallback((patch: Partial<UserPrefs>) => {
    if (uid == null) return;
    setPrefsState(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(keyFor(uid), JSON.stringify(next)); } catch { /* empty */ }
      window.dispatchEvent(new CustomEvent('userPrefsChanged', { detail: { uid } }));
      return next;
    });
  }, [uid]);

  return { prefs, setPrefs };
}
