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

const KEYS = {
  entries: 'pc_entries',
  settings: 'pc_settings'
};

export async function loadEntries(): Promise<Entry[]> {
  const raw = await AsyncStorage.getItem(KEYS.entries);
  return raw ? JSON.parse(raw) : [];
}

export async function saveEntry(e: Entry) {
  const all = await loadEntries();
  all.unshift(e);
  await AsyncStorage.setItem(KEYS.entries, JSON.stringify(all));
}

export async function loadSettings(): Promise<Settings | null> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSettings(s: Settings) {
  const prev = (await loadSettings()) || {};
  const merged = { ...prev, ...s };
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(merged));
}

export function calcJournalStreak(entries: Entry[]): number {
  const days = new Set(entries.filter(e => e.type === 'journal').map(e => new Date(e.ts).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }
  return streak;
}
