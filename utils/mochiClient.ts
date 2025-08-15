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

// Generate a unique session ID for this browser/tab
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('chat.session.id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('chat.session.id', sessionId);
  }
  return sessionId;
}

const CHAT_KEY_BASE = 'mochi.chat.v1';
function getChatKey(): string {
  return `${CHAT_KEY_BASE}.${getSessionId()}`;
}

export function loadChat(): ChatMsg[] {
  try { 
    // First check session-specific storage
    const sessionKey = getChatKey();
    const sessionData = localStorage.getItem(sessionKey);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // Fallback to old key for existing users (migration)
    const oldData = localStorage.getItem(CHAT_KEY_BASE);
    if (oldData) {
      const parsed = JSON.parse(oldData);
      // Save to new session-specific key
      localStorage.setItem(sessionKey, JSON.stringify(parsed));
      // Clear old key to avoid confusion
      localStorage.removeItem(CHAT_KEY_BASE);
      return parsed;
    }
    
    return [];
  } catch { 
    return []; 
  }
}

export function saveChat(msgs: ChatMsg[]) {
  try { 
    const sessionKey = getChatKey();
    localStorage.setItem(sessionKey, JSON.stringify(msgs.slice(-40))); 
  } catch {}
}

// Function to clear current session (for reset)
export function clearCurrentSession() {
  try {
    const sessionKey = getChatKey();
    localStorage.removeItem(sessionKey);
    // Also clear the session ID to start completely fresh
    sessionStorage.removeItem('chat.session.id');
  } catch {}
}
