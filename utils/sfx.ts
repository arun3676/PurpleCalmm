const CACHE = new Map<string, HTMLAudioElement>();

const SOURCES: Record<string, string> = {
  goodnight_ko: '/assets/goodnight_ko.mp3',
  goodnight_en: '/assets/goodnight_en.mp3',
  sad_meow: '/assets/sad_meow.mp3',
  soft_kitty: '/assets/soft_kitty.mp3',
};

let unlocked = false;

export function getAudio(key: keyof typeof SOURCES) {
  let a = CACHE.get(key as string);
  if (!a) {
    a = new Audio(SOURCES[key]);
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    CACHE.set(key as string, a);
  }
  return a!;
}

export async function ensureUnlocked() {
  if (unlocked) return;
  const a = getAudio('goodnight_ko' as any);
  try {
    a.muted = true;
    await a.play();
    a.pause(); a.currentTime = 0;
    a.muted = false;
    unlocked = true;
  } catch {
    // ignore; will unlock on a later gesture
  }
}

export async function playOnce(key: keyof typeof SOURCES, volume = 0.8) {
  const a = getAudio(key);
  a.currentTime = 0;
  a.loop = false;
  a.volume = Math.max(0, Math.min(1, volume));
  return a.play();
}

export function stop(key: keyof typeof SOURCES) {
  const a = CACHE.get(key as string);
  if (a) { a.pause(); a.currentTime = 0; }
}


