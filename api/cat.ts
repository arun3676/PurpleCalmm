import type { VercelRequest, VercelResponse } from '@vercel/node';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) { res.status(500).json({ error: 'Missing OPENAI_API_KEY' }); return; }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const messages = (body?.messages || []).map((m: any) => ({ role: m.role, content: m.content }));
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 250 })
    });
    if (!r.ok) {
      const t = await r.text();
      res.status(500).json({ error: 'upstream', detail: t });
      return;
    }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here. 💜";
    res.status(200).json({ reply });
  } catch (e: any) {
    res.status(500).json({ error: 'server', detail: e?.message || String(e) });
  }
}
