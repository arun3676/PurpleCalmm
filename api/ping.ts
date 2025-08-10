export const config = { runtime: 'edge' } as const;
export default async function handler() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
