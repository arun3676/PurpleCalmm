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

const KEYS = { entries: 'pc_entries', settings: 'pc_settings' };
const hasLS = typeof window !== 'undefined' && !!window.localStorage;

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

export async function loadSettings(): Promise<Settings | null> {
  const raw = await getItem(KEYS.settings);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export async function saveSettings(s: Settings) {
  const prev = (await loadSettings()) || {};
  const merged = { ...prev, ...s };
  await setItem(KEYS.settings, JSON.stringify(merged));
}

export function calcJournalStreak(entries: Entry[]): number {
  const days = new Set(entries.filter(e => e.type === 'journal').map(e => new Date(e.ts).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++; else break;
  }
  return streak;
}
