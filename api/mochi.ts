export const runtime = 'edge';

type Role = 'user' | 'assistant' | 'system';
type Msg = { role: Role; content: string };

const SYSTEM = `
You are Mochi the Cat, a gentle, practical companion.
Style: brief empathy + specific steps. Cat-isms lightly ("mew", "purr").
If asked to sing, set action PLAY_SOFT_KITTY (no lyrics).
Actions: PLAY_SOFT_KITTY | START_BREATHING | START_MIGRAINE_TIMER | START_SLEEP | SAVE_JOURNAL | NONE
Return STRICT JSON:
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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: { 'Content-Type': 'application/json' }});
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }

  let payload: any;
  try { payload = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' }}); }

  const messages = Array.isArray(payload?.messages) ? (payload.messages as Msg[]).slice(-12) : [];

  // 25s hard timeout to avoid Vercel 300s 504s
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort('timeout'), 25_000);

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM },
          ...messages,
          { role: 'user', content: 'Reply ONLY with the strict JSON object described above.' }
        ]
      }),
      signal: ctrl.signal
    });

    clearTimeout(timer);

    if (!r.ok) {
      const errText = await r.text().catch(()=> 'error');
      return new Response(JSON.stringify({ error: 'upstream', detail: errText }), { status: 502, headers: { 'Content-Type': 'application/json' }});
    }

    const data = await r.json().catch(()=> ({} as any));
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const parsed = safeJSON(raw) ?? { reply: String(raw || 'Mew… I had trouble.'), followup: null, action: 'NONE', minutes: null, journal: null };
    const clean = sanitize(parsed);

    return new Response(JSON.stringify(clean), { headers: { 'Content-Type': 'application/json' }});
  } catch (e: any) {
    clearTimeout(timer);
    const msg = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'mochi-failed');
    return new Response(JSON.stringify({ error: msg }), { status: 504, headers: { 'Content-Type': 'application/json' }});
  }
}
