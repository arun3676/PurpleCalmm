import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

// ------- Web audio ctx helpers -------
let webCtx: AudioContext | null = null;
function ctx() {
  if (webCtx) return webCtx;
  const C = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  webCtx = C ? new C() : null;
  return webCtx!;
}
export async function resumeAll() {
  if (Platform.OS !== 'web') return;
  const c = ctx(); if (c && c.state !== 'running') await c.resume();
}
export async function pauseAll() {
  if (Platform.OS !== 'web') return;
  const c = ctx(); if (c && c.state === 'running') await c.suspend();
}
function makeGain(v: number) {
  const c = ctx(); if (!c) return null;
  const g = c.createGain(); g.gain.value = v; g.connect(c.destination); return g;
}
function noiseBuffer(color: 'white'|'pink'|'brown') {
  const c = ctx(); if (!c) return null;
  const size = 2*c.sampleRate; const b = c.createBuffer(1, size, c.sampleRate);
  const d = b.getChannelData(0);
  if (color === 'white') for (let i=0;i<size;i++) d[i] = Math.random()*2-1;
  else if (color === 'pink') { let b0=0,b1=0,b2=0; for (let i=0;i<size;i++){ const w=Math.random()*2-1;
    b0=0.99765*b0+w*0.0990460; b1=0.96300*b1+w*0.2965164; b2=0.57000*b2+w*1.0526913;
    d[i]=b0+b1+b2+w*0.1848; } }
  else { let last=0; for (let i=0;i<size;i++){ const w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.5; } }
  return b;
}

// ------- Named assets -------
const sources = {
  softkitty: require('../assets/soft_kitty.mp3'),
  sadmeow: require('../assets/sad_meow.mp3'),
  goodnightko: require('../assets/goodnight_ko.mp3'),
} as const;
type SongName = keyof typeof sources;

// ------- mp3: expo-av with web HTMLAudio fallback -------
export async function playSong(name: SongName, volume = 0.7, loop = false) {
  try {
    // iOS silent switch etc.
    // @ts-ignore
    if (typeof Audio?.setAudioModeAsync === 'function') {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
    if (Platform.OS !== 'web') {
      const { sound } = await Audio.Sound.createAsync(sources[name], { isLooping: loop, volume });
      await sound.playAsync(); return sound;
    }
    // Web: try expo-av first
    try {
      await resumeAll();
      const { sound } = await Audio.Sound.createAsync(sources[name], { isLooping: loop, volume });
      await sound.playAsync(); return sound;
    } catch {
      // Fallback: HTMLAudio via Asset
      const asset = Asset.fromModule(sources[name]);
      if (!asset.downloaded) await asset.downloadAsync();
      const el = new Audio(asset.localUri || asset.uri);
      el.loop = loop; el.volume = volume;
      await el.play().catch(() => {});
      return {
        stopAsync: async () => { try { el.pause(); el.currentTime = 0; } catch {} },
        unloadAsync: async () => { try { (el as any).src=''; } catch {} }
      } as any;
    }
  } catch { return null; }
}

export async function stopAndUnload(snd: any) {
  try {
    if (!snd) return;
    if (typeof snd.stopAsync === 'function') await snd.stopAsync();
    if (typeof snd.unloadAsync === 'function') await snd.unloadAsync();
  } catch {}
}

// ------- Web synthetic loops -------
function webOcean(vol: number) {
  const c = ctx(); if (!c) return null;
  const g = makeGain(vol)!;
  const src = c.createBufferSource(); src.buffer = noiseBuffer('brown')!; src.loop = true;
  const lp = c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 700;
  const lfo = c.createOscillator(); const lfoGain = c.createGain();
  lfo.type='sine'; lfo.frequency.value = 0.08; lfoGain.gain.value = 500;
  lfo.connect(lfoGain).connect(lp.frequency);
  src.connect(lp).connect(g); src.start(); lfo.start();
  return { stopAsync: async () => { try { src.stop(); lfo.stop(); } catch {} }, unloadAsync: async () => {} } as any;
}
function webBrown(vol: number) {
  const c = ctx(); if (!c) return null;
  const g = makeGain(vol)!; const src = c.createBufferSource();
  src.buffer = noiseBuffer('brown')!; src.loop = true; src.connect(g); src.start();
  return { stopAsync: async () => { try { src.stop(); } catch {} }, unloadAsync: async () => {} } as any;
}
function webSoftPurr(vol: number) {
  const c = ctx(); if (!c) return null;
  const g = makeGain(vol)!;
  const a = c.createOscillator(), b = c.createOscillator(), trem = c.createOscillator(), tremG = c.createGain();
  a.type='sine'; b.type='sine'; a.frequency.value=50; b.frequency.value=52.1;
  trem.type='sine'; trem.frequency.value=1.8; tremG.gain.value = vol*0.35;
  trem.connect(tremG).connect(g.gain);
  a.connect(g); b.connect(g); a.start(); b.start(); trem.start();
  return { stopAsync: async () => { try { a.stop(); b.stop(); trem.stop(); } catch {} }, unloadAsync: async () => {} } as any;
}

export async function playLoop(name: 'ocean'|'brown'|'softpurr', volume = 0.4) {
  if (Platform.OS === 'web') {
    await resumeAll();
    if (name === 'ocean') return webOcean(volume);
    if (name === 'brown') return webBrown(volume);
    if (name === 'softpurr') return webSoftPurr(volume);
    return null;
  }
  // native: fall back to softpurr file if you add one; else no-op
  return null;
}
export async function playOneShot(_: 'chime', __: number) { return null; }

// Minimal stub to keep existing imports safe
export async function playMochiLullaby(_: number = 0.4) { return null; }
