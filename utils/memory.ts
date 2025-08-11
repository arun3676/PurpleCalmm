export type MemoryItem = { text: string; ts: number };

const KEY = 'mochi.memories.v1';

function read(): MemoryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function write(items: MemoryItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
}

export function loadMemories(): MemoryItem[] {
  return read().slice(0, 50); // cap
}

export function memoryStrings(): string[] {
  return loadMemories().map(m => m.text);
}

export function addMemories(lines: string[]) {
  if (!lines?.length) return;
  const now = Date.now();
  const items = read();
  const set = new Set(items.map(i => i.text.toLowerCase()));
  for (const raw of lines) {
    const t = (raw || '').trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (set.has(k)) continue;
    items.unshift({ text: t, ts: now });
    set.add(k);
  }
  write(items.slice(0, 50));
}

export function forgetMemories(lines: string[]) {
  if (!lines?.length) return;
  const dell = new Set(lines.map(s => s.toLowerCase().trim()))
  const out = read().filter(i => !dell.has(i.text.toLowerCase()))
  write(out);
}


