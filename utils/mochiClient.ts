export type MochiReply = {
  reply: string;
  followup: string | null;
  action: 'PLAY_SOFT_KITTY'|'START_BREATHING'|'START_MIGRAINE_TIMER'|'START_SLEEP'|'SAVE_JOURNAL'|'NONE';
  minutes: number | null;
  journal: string | null;
};
export type ChatMsg = { role: 'user'|'assistant'; content: string };

export async function askMochi(history: ChatMsg[]): Promise<MochiReply> {
  const r = await fetch('/api/mochi', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ messages: history })
  });
  if (!r.ok) throw new Error('mochi api error');
  return await r.json();
}
