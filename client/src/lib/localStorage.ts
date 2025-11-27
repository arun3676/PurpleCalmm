// Local storage utilities for PurrpleCalm
// All data is stored locally in the browser

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MigraineLog {
  id: string;
  date: string;
  severity: number;
  duration?: number;
  triggers?: string[];
  notes?: string;
  createdAt: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
  createdAt: number;
}

export interface BTSJournalEntry {
  id: string;
  date: string;
  quote: string;
  member?: string;
  reflection?: string;
  mood?: string;
  createdAt: number;
}

export interface UserSettings {
  chatPersonality: 'comforting' | 'funny' | 'rude';
  theme: 'light' | 'dark';
}

// Journal functions
export function getJournalEntries(): JournalEntry[] {
  const data = localStorage.getItem('journal_entries');
  return data ? JSON.parse(data) : [];
}

export function saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): void {
  const entries = getJournalEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  entries.unshift(newEntry);
  localStorage.setItem('journal_entries', JSON.stringify(entries));
}

export function getJournalStreak(): number {
  const entries = getJournalEntries();
  if (entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i]!.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Chat functions
export function getChatMessages(): ChatMessage[] {
  const data = localStorage.getItem('chat_messages');
  return data ? JSON.parse(data) : [];
}

export function saveChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
  const messages = getChatMessages();
  const newMessage: ChatMessage = {
    ...message,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  messages.push(newMessage);
  localStorage.setItem('chat_messages', JSON.stringify(messages));
}

export function clearChatHistory(): void {
  localStorage.setItem('chat_messages', JSON.stringify([]));
}

// Migraine functions
export function getMigraineLogs(): MigraineLog[] {
  const data = localStorage.getItem('migraine_logs');
  return data ? JSON.parse(data) : [];
}

export function saveMigraineLog(log: Omit<MigraineLog, 'id' | 'createdAt'>): void {
  const logs = getMigraineLogs();
  const newLog: MigraineLog = {
    ...log,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  logs.unshift(newLog);
  localStorage.setItem('migraine_logs', JSON.stringify(logs));
}

// Weight tracking functions
export function getWeightEntries(): WeightEntry[] {
  const data = localStorage.getItem('weight_entries');
  return data ? JSON.parse(data) : [];
}

export function saveWeightEntry(entry: Omit<WeightEntry, 'id' | 'createdAt'>): void {
  const entries = getWeightEntries();
  const newEntry: WeightEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  entries.unshift(newEntry);
  localStorage.setItem('weight_entries', JSON.stringify(entries));
}

// BTS Journal functions
export function getBTSJournalEntries(): BTSJournalEntry[] {
  const data = localStorage.getItem('bts_journal');
  return data ? JSON.parse(data) : [];
}

export function saveBTSJournalEntry(entry: Omit<BTSJournalEntry, 'id' | 'createdAt'>): void {
  const entries = getBTSJournalEntries();
  const newEntry: BTSJournalEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  entries.unshift(newEntry);
  localStorage.setItem('bts_journal', JSON.stringify(entries));
}

// Settings functions
export function getUserSettings(): UserSettings {
  const data = localStorage.getItem('user_settings');
  return data ? JSON.parse(data) : { chatPersonality: 'comforting', theme: 'light' };
}

export function saveUserSettings(settings: Partial<UserSettings>): void {
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('user_settings', JSON.stringify(updated));
}

// Cuddles counter
export function getCuddlesCount(): number {
  const data = localStorage.getItem('cuddles_count');
  return data ? parseInt(data, 10) : 0;
}

export function incrementCuddles(): number {
  const count = getCuddlesCount() + 1;
  localStorage.setItem('cuddles_count', count.toString());
  return count;
}

export function resetDailyCuddles(): void {
  const lastReset = localStorage.getItem('last_cuddles_reset');
  const today = new Date().toDateString();
  
  if (lastReset !== today) {
    localStorage.setItem('cuddles_count', '0');
    localStorage.setItem('last_cuddles_reset', today);
  }
}
