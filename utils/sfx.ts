const MAP = new Map<string, HTMLAudioElement>();

const SRC: Record<string, string> = {
  goodnight_ko: '/assets/goodnight_ko.mp3',
  goodnight_en: '/assets/goodnight_en.mp3',
};

let unlocked = false;

function get(key: keyof typeof SRC) {
  let a = MAP.get(key as string);
  if (!a) {
    a = new Audio(SRC[key]);
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    (a as any).playsInline = true; // iOS
    MAP.set(key as string, a);
  }
  return a!;
}

export async function unlockAudio() {
  if (unlocked) return;
  try {
    const a = get('goodnight_ko');
    a.muted = true;
    await a.play();   // will succeed only inside a gesture
    a.pause(); a.currentTime = 0; a.muted = false;
    unlocked = true;
  } catch {
    // ignore; we’ll try again on next gesture
  }
}

function waitUntilCanPlay(a: HTMLAudioElement) {
  return new Promise<void>((resolve, reject) => {
    if (a.readyState >= 3) return resolve(); // HAVE_FUTURE_DATA
    const onOk = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject((a as any).error || new Error('audio error')); };
    const cleanup = () => {
      a.removeEventListener('canplaythrough', onOk);
      a.removeEventListener('error', onErr);
    };
    a.addEventListener('canplaythrough', onOk, { once:true });
    a.addEventListener('error', onErr, { once:true });
    a.load(); // kick network
  });
}

export async function playGoodnight(voice: 'ko'|'en' = 'ko', volume = 0.8) {
  const key = (voice === 'en' ? 'goodnight_en' : 'goodnight_ko') as const;
  const a = get(key);
  await waitUntilCanPlay(a);
  a.currentTime = 0;
  a.loop = false;
  a.volume = Math.max(0, Math.min(1, volume));
  return a.play(); // returns a promise; surface errors to caller
}


