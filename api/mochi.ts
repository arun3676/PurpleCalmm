import type { VercelRequest, VercelResponse } from '@vercel/node';

type Role = 'user'|'assistant'|'system';
type Msg = { role: Role; content: string };

const SYSTEM = `
You are Mochi the Cat — gentle, practical, brief.
1 line of empathy, then 2–4 specific steps. Light cat-isms ("mew", "purr").
Crisis language → encourage urgent help kindly.
If asked to sing, set action PLAY_SOFT_KITTY (no lyrics).
Actions: PLAY_SOFT_KITTY | START_BREATHING | START_MIGRAINE_TIMER | START_SLEEP | SAVE_JOURNAL | NONE
Return STRICT JSON ONLY:
{"reply":"","followup":null,"action":"PLAY_SOFT_KITTY","minutes":null,"journal":null}
`;

function safeJSON(s: string) { try { return JSON.parse(s); } catch { return null; } }
function sanitize(o: any) {
  const A = new Set(['PLAY_SOFT_KITTY','START_BREATHING','START_MIGRAINE_TIMER','START_SLEEP','SAVE_JOURNAL','NONE']);
  return {
    reply: String(o?.reply ?? ''),
    followup: o?.followup ? String(o.followup) : null,
    action: A.has(String(o?.action)) ? String(o.action) : 'NONE',
    minutes: Number.isFinite(Number(o?.minutes)) ? Math.max(1, Math.min(120, Math.floor(Number(o.minutes)))) : null,
    journal: o?.journal ? String(o.journal).slice(0, 300) : null,
  };
}

const FALLBACK = sanitize({
  reply:
    "Mew—the cloud was fussy. Try 4-4-4: inhale 4, hold 4, exhale 4. Want me to start Calm or set a 5-min migraine timer?",
  followup: "I can also save a quick note for you.",
  action: 'NONE',
  minutes: null,
  journal: null,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(200).setHeader('x-mochi', 'no-key-fallback').json(FALLBACK);

  let messages: Msg[] = [];
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    messages = Array.isArray(body?.messages) ? (body.messages as Msg[]).slice(-12) : [];
  } catch {
    return res.status(400).json({ error: 'Bad JSON' });
  }
  if (messages.length === 0) return res.status(200).setHeader('x-mochi','no-messages-fallback').json(FALLBACK);

  // 20s hard timeout so we never hit Vercel 300s
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM },
          ...messages,
          { role: 'user', content: 'Reply ONLY with the strict JSON object described above.' },
        ],
      }),
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    if (!r.ok) {
      const detail = await r.text().catch(()=>' ');
      return res.status(200).setHeader('x-mochi', `upstream-${r.status}`).json(FALLBACK);
    }

    const data: any = await r.json().catch(() => ({}));
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const parsed = safeJSON(raw) ?? FALLBACK;
    const clean = sanitize(parsed);

    return res.status(200).setHeader('x-mochi','ok').json(clean);
  } catch (e: any) {
    clearTimeout(timer);
    const tag = e?.name === 'AbortError' ? 'timeout-fallback' : 'net-fallback';
    return res.status(200).setHeader('x-mochi', tag).json(FALLBACK);
  }
}
