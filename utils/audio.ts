import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

type SongName = 'goodnightko' | 'sadmeow' | 'softkitty' | 'winterbear';

const sources: Record<SongName, any> = {
  goodnightko: require('../assets/goodnight_ko.mp3'),
  sadmeow: require('../assets/sad_meow.mp3'),
  softkitty: require('../assets/soft_kitty.mp3'),
  winterbear: require('../assets/winter_bear.mp3'),
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

// --- Minimal web soft purr generator for press-and-hold anchor ---
function webSoftPurr(volume = 0.35) {
  const c = ctx(); if (!c) return null;
  const master = c.createGain(); master.gain.value = volume; master.connect(c.destination);
  const a = c.createOscillator(); const b = c.createOscillator();
  const trem = c.createOscillator(); const tremG = c.createGain();
  a.type = 'sine'; b.type = 'sine'; a.frequency.value = 50; b.frequency.value = 52.1;
  trem.type = 'sine'; trem.frequency.value = 1.8; tremG.gain.value = volume * 0.35;
  trem.connect(tremG).connect(master.gain);
  a.connect(master); b.connect(master);
  a.start(); b.start(); trem.start();
  return {
    stopAsync: async () => { try { a.stop(); b.stop(); trem.stop(); } catch {} },
    unloadAsync: async () => {}
  } as any;
}
export async function playLoop(name: 'softpurr', volume = 0.35) {
  if (Platform.OS === 'web') { await resumeAll(); if (name === 'softpurr') return webSoftPurr(volume); }
  return null;
}
