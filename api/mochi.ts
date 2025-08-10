export const config = { runtime: 'edge' } as const;

type Msg = { role: 'user'|'assistant'|'system'; content: string };

const SYSTEM = `
You are **Mochi the Cat**, a comforting cat friend.
Style: gentle, warm, compact. 1 empathetic line, then 2–4 specific steps.
Ask at most ONE short follow-up when useful. Use tiny cat-isms sparingly
("mew", "purr")—no overdoing it. Avoid generic platitudes.

Safety: If user mentions self-harm, panic emergency, stroke signs, or
severe migraine red flags (worst headache, new neuro symptoms, fever+rash),
respond kindly and advise urgent help with local numbers if asked.

Actions: When appropriate, set:
- PLAY_SOFT_KITTY         (no lyrics—just trigger song)
- START_BREATHING         (4-4-4 calm screen)
- START_MIGRAINE_TIMER    (minutes: int)
- START_SLEEP             (goodnight flow)
- SAVE_JOURNAL            (journal: short line)
- NONE

Output STRICT JSON:
{
 "reply": "string",
 "followup": "string | null",
 "action": "PLAY_SOFT_KITTY|START_BREATHING|START_MIGRAINE_TIMER|START_SLEEP|SAVE_JOURNAL|NONE",
 "minutes": number | null,
 "journal": "string | null"
}
Never output song lyrics. If asked to sing, set action PLAY_SOFT_KITTY.
Keep reply ≤ 120 words, accessible, migraine/sleep/grounding tips when relevant.
`;

export default async function handler(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] };
    const trimmed = (messages || []).slice(-12);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM },
          ...trimmed,
          { role: 'user', content: 'Reply in the exact JSON schema described above.' }
        ]
      })
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    const data = await res.json();
    const out = data?.choices?.[0]?.message?.content;
    let parsed;
    try { parsed = JSON.parse(out); }
    catch { parsed = { reply: String(out || '...'), followup: null, action: 'NONE', minutes: null, journal: null }; }

    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'mochi-failed' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
