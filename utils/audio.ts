import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

type NamedSound = 'softpurr' | 'ocean' | 'drizzle' | 'windchimes' | 'brown' | 'chime' | 'softkitty';
const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  // Optional real files later:
  // ocean: require('../assets/ocean.mp3'),
  // softpurr: require('../assets/purr.mp3'),
  // drizzle: require('../assets/rain.mp3'),
  // windchimes: require('../assets/chime.mp3'),
  // brown: require('../assets/brown.mp3'),
  // chime: require('../assets/ting.mp3'),
  softkitty: require('../assets/soft_kitty.mp3'),
};

type WebNode = {
  stopAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
  setVolume?: (v: number) => void;
};
type SoundLike = any | WebNode;

let webCtx: AudioContext | null = null;
function ctx() {
  if (webCtx) return webCtx;
  const C = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  webCtx = C ? new C() : null;
  return webCtx!;
}
async function webResume() { const c = ctx(); if (!c) return null; if (c.state !== 'running') await c.resume(); return c; }

function makeGain(v: number) {
  const c = ctx(); if (!c) return null;
  const g = c.createGain(); g.gain.value = v; g.connect(c.destination); return g;
}
function noiseBuffer(color: 'white'|'pink'|'brown') {
  const c = ctx(); if (!c) return null;
  const size = 2 * c.sampleRate; const buf = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0);
  if (color === 'white') { for (let i=0;i<size;i++) data[i] = Math.random()*2-1; }
  else if (color === 'pink') {
    // simple pink filter
    let b0=0,b1=0,b2=0; for (let i=0;i<size;i++) { const w = Math.random()*2-1;
      b0 = 0.99765*b0 + w*0.0990460;
      b1 = 0.96300*b1 + w*0.2965164;
      b2 = 0.57000*b2 + w*1.0526913;
      data[i] = b0 + b1 + b2 + w*0.1848;
    }
  } else {
    // brown
    let last=0; for (let i=0;i<size;i++) { const w=(Math.random()*2-1); last = (last + 0.02*w)/1.02; data[i]=last*3.5; }
  }
  return buf;
}

// --- Soundscapes (web) ---
function webOcean(volume: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const gain = makeGain(volume)!;

  // Brown noise through slow lowpass wobble
  const src = c.createBufferSource(); src.buffer = noiseBuffer('brown')!; src.loop = true;
  const lp = c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 600;
  const lfo = c.createOscillator(); const lfoGain = c.createGain();
  lfo.type='sine'; lfo.frequency.value = 0.08; lfoGain.gain.value = 500; // slow swell
  lfo.connect(lfoGain).connect(lp.frequency);
  src.connect(lp).connect(gain);

  src.start(); lfo.start();

  return {
    stopAsync: async () => { try { src.stop(); lfo.stop(); } catch {} },
    unloadAsync: async () => {},
    setVolume: (v: number) => { gain.gain.value = v; }
  };
}

function webSoftPurr(volume: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const gain = makeGain(volume)!;

  // Two low sines beating + mild tremolo
  const a = c.createOscillator(), b = c.createOscillator(), trem = c.createOscillator(), tremGain = c.createGain();
  a.type='sine'; b.type='sine'; a.frequency.value=50; b.frequency.value=52.1;
  trem.type='sine'; trem.frequency.value=1.8; tremGain.gain.value = volume*0.35; // subtle
  trem.connect(tremGain).connect(gain.gain);
  a.connect(gain); b.connect(gain);
  a.start(); b.start(); trem.start();

  return {
    stopAsync: async () => { try { a.stop(); b.stop(); trem.stop(); } catch {} },
    unloadAsync: async () => {},
    setVolume: (v:number) => { gain.gain.value = v; tremGain.gain.value = v*0.35; }
  };
}

function webDrizzle(volume: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const gain = makeGain(volume)!;
  // Pink noise + random "drop" bursts (HP filtered)
  const bed = c.createBufferSource(); bed.buffer = noiseBuffer('pink')!; bed.loop = true;
  const hp = c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 800;
  bed.connect(hp).connect(gain);
  bed.start();

  // sporadic drops
  const interval = setInterval(() => {
    const src = c.createBufferSource(); src.buffer = noiseBuffer('white')!;
    const bpf = c.createBiquadFilter(); bpf.type='bandpass'; bpf.frequency.value = 1500 + Math.random()*1500; bpf.Q.value=8;
    const g = c.createGain(); g.gain.value = volume*0.12;
    src.connect(bpf).connect(g).connect(gain);
    src.start(); src.stop(c.currentTime + 0.08 + Math.random()*0.12);
  }, 220 + Math.random()*160);

  return {
    stopAsync: async () => { try { clearInterval(interval); bed.stop(); } catch {} },
    unloadAsync: async () => {},
    setVolume: (v:number) => { gain.gain.value = v; }
  };
}

function webWindChimes(volume: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const gain = makeGain(volume)!;

  // Random gentle chime tones with decay
  function ping(freq: number) {
    const osc = c.createOscillator(); const g = c.createGain();
    osc.type='sine'; osc.frequency.value = freq;
    g.gain.value = volume*0.6;
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.8);
    osc.connect(g).connect(gain); osc.start(); osc.stop(c.currentTime + 1.8);
  }
  const tones = [523, 659, 784, 987]; // C5 E5 G5 B5ish
  const interval = setInterval(() => { ping(tones[Math.floor(Math.random()*tones.length)]); }, 1700 + Math.random()*1500);

  // subtle airy bed
  const air = c.createBufferSource(); air.buffer = noiseBuffer('pink')!; air.loop = true;
  const lp = c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 2500;
  air.connect(lp).connect(gain); air.start();

  return {
    stopAsync: async () => { try { clearInterval(interval); air.stop(); } catch {} },
    unloadAsync: async () => {},
    setVolume: (v:number) => { gain.gain.value = v; }
  };
}

function webBrown(volume: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const gain = makeGain(volume)!;
  const src = c.createBufferSource(); src.buffer = noiseBuffer('brown')!; src.loop = true;
  src.connect(gain); src.start();
  return {
    stopAsync: async () => { try { src.stop(); } catch {} },
    unloadAsync: async () => {},
    setVolume: (v:number) => { gain.gain.value = v; }
  };
}

function webChime(vol: number): WebNode | null {
  const c = ctx(); if (!c) return null;
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type='sine'; osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.6);
  g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
  osc.connect(g).connect(c.destination); osc.start(); osc.stop(c.currentTime + 0.8);
  return { stopAsync: async () => {}, unloadAsync: async () => {}, setVolume: ()=>{} };
}

// --- Public API ---
export async function playLoop(name: NamedSound, volume = 0.4): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume();
    if (sources[name]) {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
        await sound.playAsync(); return sound; } catch {}
    }
    if (name === 'ocean') return webOcean(volume);
    if (name === 'softpurr') return webSoftPurr(volume);
    if (name === 'drizzle') return webDrizzle(volume);
    if (name === 'windchimes') return webWindChimes(volume);
    if (name === 'brown') return webBrown(volume);
    return null;
  }
  // Native: requires real files to sound great; will try if provided
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
    await sound.playAsync(); return sound;
  } catch { return null; }
}

export async function playOneShot(name: NamedSound, volume = 0.7): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume();
    if (name === 'chime') return webChime(volume);
    if (sources[name]) {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: false, volume });
        await sound.playAsync(); return sound; } catch { return null; }
    }
    return null;
  }
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: false, volume });
    await sound.playAsync(); return sound;
  } catch { return null; }
}

export async function stopAndUnload(sound: any) {
  try {
    if (!sound) return;
    if (typeof sound.stopAsync === 'function') await sound.stopAsync();
    if (typeof sound.unloadAsync === 'function') await sound.unloadAsync();
  } catch {}
}

export async function setVolume(sound: any, v: number) {
  try {
    if (!sound) return;
    if (typeof sound.setVolumeAsync === 'function') await sound.setVolumeAsync(v);
    if (typeof sound.setVolume === 'function') sound.setVolume(v);
  } catch {}
}

export async function playSong(name: 'softkitty', volume = 0.6) {
  try {
    // Ensure web audio is unlocked (no-op if not applicable)
    // @ts-ignore
    if (typeof Audio?.setAudioModeAsync === 'function') {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
    // @ts-ignore
    const { sound } = await Audio.Sound.createAsync(sources[name]!, {
      isLooping: false,
      volume,
    });
    await sound.playAsync();
    return sound;
  } catch {
    return null;
  }
}

// --- Mochi's Cozy Lullaby (web synth) ---
export async function playMochiLullaby(volume = 0.4): Promise<any> {
  // Web-only synth. On native, just return null (you can wire a real mp3 later).
  // Reuses the same AudioContext pattern we already use.
  // If your file doesn't have ctx()/makeGain helpers, copy minimal versions here like in earlier code.
  // Assumes you already implemented ctx() and makeGain() in this file. If not, tell me and I’ll inline them.

  // @ts-ignore
  const hasCtx = typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
  if (!hasCtx) return null;
  // @ts-ignore
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  // @ts-ignore
  const c: AudioContext = (globalThis as any).__mochiCtx || new Ctx();
  // @ts-ignore
  (globalThis as any).__mochiCtx = c;
  if (c.state !== 'running') { try { await c.resume(); } catch {} }

  const master = c.createGain();
  master.gain.value = volume;
  master.connect(c.destination);

  const notes: Array<[number, number]> = [
    // freq (Hz), duration (ms) — soft, lullaby-ish
    [392, 700], [440, 700], [494, 700], [523, 1100],
    [494, 700], [440, 700], [392, 1000],
    [392, 700], [440, 700], [494, 700], [523, 1100],
  ];

  const made: OscillatorNode[] = [];
  const timers: any[] = [];
  let t = 0;

  function schedule(freq: number, durMs: number) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    g.gain.value = 0.0001;
    osc.connect(g).connect(master);

    const startAt = c.currentTime + t / 1000;
    const stopAt = startAt + durMs / 1000;

    osc.start(startAt);
    // gentle attack/decay
    g.gain.setValueAtTime(0.0001, startAt);
    g.gain.linearRampToValueAtTime(volume, startAt + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    osc.stop(stopAt);

    made.push(osc);
    t += durMs + 90;
  }

  notes.forEach(([f, d]) => schedule(f, d));

  return {
    stopAsync: async () => {
      try { timers.forEach(clearTimeout); } catch {}
      try { made.forEach(o => { try { o.stop(); } catch {} }); } catch {}
    },
    unloadAsync: async () => {}
  };
}
