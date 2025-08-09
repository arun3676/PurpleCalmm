import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

type SongName = 'goodnightko' | 'sadmeow' | 'softkitty';

const sources: Record<SongName, any> = {
  goodnightko: require('../assets/goodnight_ko.mp3'),
  sadmeow: require('../assets/sad_meow.mp3'),
  softkitty: require('../assets/soft_kitty.mp3'),
};

// --- Web AudioContext unlock helpers (no-op on native) ---
let webCtx: AudioContext | null = null;
function ctx() {
  if (Platform.OS !== 'web') return null as any;
  if (webCtx) return webCtx;
  const C = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  webCtx = C ? new C() : null;
  return webCtx!;
}
export async function resumeAll() {
  if (Platform.OS !== 'web') return;
  const c = ctx(); if (c && c.state !== 'running') await c.resume();
}

// Track all currently playing song objects so we can stop them
let activeSongs: any[] = [];

export async function stopAndUnload(snd: any) {
  try {
    if (!snd) return;
    if (typeof snd.stopAsync === 'function') await snd.stopAsync();
    if (typeof snd.unloadAsync === 'function') await snd.unloadAsync();
  } catch {}
}
export async function stopAllSongs() {
  const list = [...activeSongs];
  activeSongs = [];
  await Promise.all(list.map(s => stopAndUnload(s)));
}

// Robust mp3 player: expo-av; web fallback to HTMLAudio if needed
export async function playSong(name: SongName, volume = 0.8, loop = false) {
  // iOS silent switch etc.
  try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); } catch {}
  if (Platform.OS === 'web') { await resumeAll(); }

  // Try expo-av first
  try {
    const { sound } = await Audio.Sound.createAsync(sources[name], { isLooping: loop, volume });
    await sound.playAsync();
    activeSongs.push(sound);
    return sound;
  } catch {}

  // Web fallback: HTMLAudio via Asset
  try {
    const a = Asset.fromModule(sources[name]);
    if (!a.downloaded) await a.downloadAsync();
    const HtmlAudioCtor: any = (globalThis as any).Audio || (window as any)?.Audio;
    const el = HtmlAudioCtor ? new HtmlAudioCtor(a.localUri || a.uri) : null;
    if (!el) return null;
    el.loop = loop; el.volume = volume;
    await el.play?.().catch(() => {});
    const wrapper = {
      stopAsync: async () => { try { el.pause?.(); el.currentTime = 0; } catch {} },
      unloadAsync: async () => { try { el.src = ''; } catch {} },
    };
    activeSongs.push(wrapper);
    return wrapper;
  } catch { return null; }
}

// --- Web meow synth loop for distinct sound (used when assets are placeholders) ---
function webMeowLoop(volume = 0.6) {
  const c = ctx(); if (!c) return null;
  const master = c.createGain(); master.gain.value = volume; master.connect(c.destination);

  function meowOnce() {
    const osc = c.createOscillator();
    const g = c.createGain();
    const vib = c.createOscillator(); const vibGain = c.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(620, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, c.currentTime + 0.28);
    vib.type = 'sine'; vib.frequency.value = 5.5; vibGain.gain.value = 7;
    vib.connect(vibGain).connect(osc.frequency);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(volume * 0.55, c.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
    osc.connect(g).connect(master);
    osc.start(); vib.start();
    osc.stop(c.currentTime + 0.6); vib.stop(c.currentTime + 0.6);
  }
  // soft air bed
  const bed = c.createBufferSource();
  const size = 2 * c.sampleRate; const buf = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0); for (let i=0;i<size;i++) data[i] = (Math.random()*2-1)*0.02;
  bed.buffer = buf; bed.loop = true; bed.connect(master); bed.start();
  const id = setInterval(meowOnce, 8000 + Math.random()*6000);
  meowOnce();
  return { stopAsync: async () => { try { clearInterval(id); bed.stop(); } catch {} }, unloadAsync: async () => {} };
}
export async function playMeowLoop(volume = 0.6) {
  if (Platform.OS === 'web') return webMeowLoop(volume);
  return playSong('sadmeow', volume, true);
}

// Optional stub so optional chaining calls like playLoop?.() elsewhere don't crash imports
export const playLoop: any = undefined;
