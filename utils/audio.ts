import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

type NamedSound = 'purr' | 'rain' | 'jazz' | 'chime' | 'ocean' | 'waterfall' | 'alarm';
const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  // Later you can add real files:
  // purr: require('../assets/purr.mp3'),
  // rain: require('../assets/rain.mp3'),
  // waterfall: require('../assets/waterfall.mp3'),
  // chime: require('../assets/chime.mp3'),
};

type SoundLike = any;

let webCtx: AudioContext | null = null;
function ctx() {
  if (webCtx) return webCtx;
  const C = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  webCtx = C ? new C() : null;
  return webCtx!;
}
async function webResume() {
  const c = ctx();
  if (!c) return null;
  if (c.state !== 'running') await c.resume();
  return c;
}
function webLoopPurr(volume: number) {
  const c = ctx(); if (!c) return null;
  const gain = c.createGain(); gain.gain.value = volume; gain.connect(c.destination);
  const osc = c.createOscillator(); const lfo = c.createOscillator(); const lfoGain = c.createGain();
  osc.type = 'sine'; osc.frequency.value = 55;
  lfo.type = 'sine'; lfo.frequency.value = 2;
  gain.gain.value = volume * 0.7; lfoGain.gain.value = volume * 0.3;
  lfo.connect(lfoGain).connect(gain.gain); osc.connect(gain);
  osc.start(); lfo.start();
  return { stopAsync: async () => { try { osc.stop(); lfo.stop(); } catch {} }, unloadAsync: async () => {} };
}
function noiseNode(volume: number, centerHz: number, q = 0.8) {
  const c = ctx(); if (!c) return null;
  const gain = c.createGain(); gain.gain.value = volume; gain.connect(c.destination);
  const size = 2 * c.sampleRate; const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0); for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buffer; src.loop = true;
  const bpf = c.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = centerHz; bpf.Q.value = q;
  src.connect(bpf).connect(gain); src.start();
  return { stopAsync: async () => { try { src.stop(); } catch {} }, unloadAsync: async () => {} };
}
function webOneShotChime(volume: number) {
  const c = ctx(); if (!c) return null;
  const osc = c.createOscillator(); const gain = c.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.6);
  gain.gain.value = volume; gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
  osc.connect(gain).connect(c.destination); osc.start(); osc.stop(c.currentTime + 0.8);
  return { stopAsync: async () => {}, unloadAsync: async () => {} };
}

export async function playLoop(name: NamedSound, volume = 0.5): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume();
    if (sources[name]) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
        await sound.playAsync(); return sound;
      } catch {}
    }
    if (name === 'purr') return webLoopPurr(volume);
    if (name === 'rain') return noiseNode(volume, 1200, 0.9);
    if (name === 'waterfall') return noiseNode(volume, 3000, 0.3);
    return null;
  }
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
    await sound.playAsync(); return sound;
  } catch { return null; }
}

export async function playOneShot(name: NamedSound, volume = 0.7): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume();
    if (name === 'chime') return webOneShotChime(volume);
    if (sources[name]) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: false, volume });
        await sound.playAsync(); return sound;
      } catch { return null; }
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
