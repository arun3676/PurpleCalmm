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
    const el = new Audio(a.localUri || a.uri);
    el.loop = loop; el.volume = volume;
    await (el as any).play?.().catch(() => {});
    const wrapper = {
      stopAsync: async () => { try { (el as any).pause?.(); (el as any).currentTime = 0; } catch {} },
      unloadAsync: async () => { try { (el as any).src = ''; } catch {} },
    };
    activeSongs.push(wrapper);
    return wrapper;
  } catch { return null; }
}

// Optional stub so optional chaining calls like playLoop?.() elsewhere don't crash imports
export const playLoop: any = undefined;
