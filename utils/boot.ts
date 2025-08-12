import { preloadSplash } from './preload';

export type BootUpdate = (pct: number, tip?: string) => void;

export async function boot(update: BootUpdate) {
  const steps: Array<{ tip: string; fn: () => Promise<void> }> = [
    { tip: 'Loading settings…', fn: async () => { await wait(180); } },
    { tip: 'Warming up Mochi…', fn: async () => { await fetch('/api/ping').catch(()=>{}); await wait(120); } },
    { tip: 'Preloading kitty…', fn: async () => { await preloadSplash(); } },
  ];
  let i = 0;
  for (const s of steps) {
    update(Math.min(95, Math.round((i / steps.length) * 100)), s.tip);
    await s.fn();
    i++;
  }
  update(100, 'Ready');
}
function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }


