export type MochiReply = {
  reply: string;
  followup: string | null;
  action: 'PLAY_SOFT_KITTY'|'START_BREATHING'|'START_MIGRAINE_TIMER'|'START_SLEEP'|'SAVE_JOURNAL'|'NONE';
  minutes: number | null;
  journal: string | null;
  memoryAdd?: string[] | null;
  memoryForget?: string[] | null;
};
export type ChatMsg = { role: 'user'|'assistant'; content: string };

export async function askMochi(history: ChatMsg[], memories: string[] = []): Promise<MochiReply> {
  const url = (typeof location !== 'undefined')
    ? new URL('/api/mochi', location.origin).toString()
    : '/api/mochi';

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 25_000);

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ messages: history, memories }),
    signal: ctrl.signal
  }).catch(() => null);

  clearTimeout(to);

  if (!r) throw new Error('network');

  const json = await r.json().catch(() => null);
  if (!json || typeof json.reply !== 'string') throw new Error('badjson');

  return json as MochiReply;
}

const CHAT_KEY = 'mochi.chat.v1';
export function loadChat(): ChatMsg[] {
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch { return []; }
}
export function saveChat(msgs: ChatMsg[]) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-40))); } catch {}
}
