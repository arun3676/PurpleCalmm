import AsyncStorage from '@react-native-async-storage/async-storage';

export type Entry = {
  id: string;
  type: 'journal' | 'migraineNote';
  mood?: 'low' | 'ok' | 'good' | 'great';
  tags?: string[];
  note?: string;
  ts: number;
};

export type Settings = {
  themeName?: 'purple' | 'vjazz';
  vibe?: boolean;
  reduceMotion?: boolean;
  defaultDurations?: { calmBreath?: number; sleepBreath?: number; migraineTimer?: number };
  reminders?: { sleep?: string; hydrate?: string };
  comfortPack?: { quotes?: string[]; images?: string[] };
};

// New app-wide settings (number-safe)
export type AppSettings = {
  theme: 'purple' | 'vjazz' | 'lilac' | 'dark';
  reduceMotion: boolean;
  migraineMinutes: number; // ALWAYS a number
  _v?: number;
};

const KEYS = { entries: 'pc_entries', settings: 'pc_settings', stickers: 'pc_stickers' };
const hasLS = typeof window !== 'undefined' && !!window.localStorage;

const SETTINGS_KEY = 'purr.settings.v1';

// Safe getters/setters (AsyncStorage → fallback to localStorage → in-memory)
async function getItem(key: string): Promise<string | null> {
  try { return await AsyncStorage.getItem(key); } catch {}
  try { if (hasLS) return window.localStorage.getItem(key); } catch {}
  return null;
}
async function setItem(key: string, value: string) {
  try { await AsyncStorage.setItem(key, value); return; } catch {}
  try { if (hasLS) { window.localStorage.setItem(key, value); return; } } catch {}
}

// ---- Public API ----
export async function loadEntries(): Promise<Entry[]> {
  const raw = await getItem(KEYS.entries);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export async function setEntries(all: Entry[]) {
  await setItem(KEYS.entries, JSON.stringify(all));
}

export async function saveEntry(e: Entry) {
  const all = await loadEntries();
  all.unshift(e);
  await setEntries(all);
}

export async function deleteEntry(id: string) {
  const all = await loadEntries();
  const next = all.filter(e => e.id !== id);
  await setEntries(next);
  return next;
}

export async function clearJournal() {
  const all = await loadEntries();
  const next = all.filter(e => e.type !== 'journal');
  await setEntries(next);
  return next;
}

// New settings helpers (number-safe)
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await getItem(SETTINGS_KEY);
    if (!raw) return { theme: 'purple', reduceMotion: false, migraineMinutes: 15, _v: 1 };
    const s = JSON.parse(raw);
    const minutes = Math.max(1, Math.min(120, parseInt(String(s.migraineMinutes ?? 15), 10) || 15));
    const allowed = new Set(['purple','vjazz','lilac','dark']);
    const theme = (allowed.has(s.theme) ? s.theme : 'purple') as AppSettings['theme'];
    return { theme, reduceMotion: !!s.reduceMotion, migraineMinutes: minutes, _v: 1 };
  } catch {
    return { theme: 'purple', reduceMotion: false, migraineMinutes: 15, _v: 1 };
  }
}

export async function saveSettings(next: Partial<AppSettings>) {
  const cur = await loadSettings();
  const merged: AppSettings = {
    ...cur,
    ...next,
    migraineMinutes: Math.max(1, Math.min(120, parseInt(String((next as any).migraineMinutes ?? cur.migraineMinutes), 10) || cur.migraineMinutes)),
  };
  await setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

export async function loadStickers(): Promise<Sticker[]> {
  const raw = await getItem(KEYS.stickers);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export async function saveSticker(s: Sticker) {
  const all = await loadStickers();
  all.unshift(s);
  await setItem(KEYS.stickers, JSON.stringify(all));
}

export type Sticker = { id: string; name: string; emoji: string; ts: number };

export function calcJournalStreak(entries: Entry[]): number {
  const days = new Set(entries.filter(e => e.type === 'journal').map(e => new Date(e.ts).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++; else break;
  }
  return streak;
}
