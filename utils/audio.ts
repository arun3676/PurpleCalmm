import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

// ---- Local/remote sources (optional real mp3s later) ----
type NamedSound = 'purr' | 'rain' | 'jazz' | 'chime' | 'ocean' | 'waterfall' | 'alarm';
const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  // Example if you add files later:
  // purr: require('../assets/purr.mp3'),
  // rain: require('../assets/rain.mp3'),
  // waterfall: require('../assets/waterfall.mp3'),
  // chime: require('../assets/chime.mp3'),
};

type SoundLike = any; // expo-av Sound on native, Web node on web

// ---------- Web fallback using WebAudio (no mp3s required) ----------
let webCtx: AudioContext | null = null;
function ensureCtx() {
  if (webCtx) return webCtx;
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  webCtx = new Ctx();
  return webCtx!;
}

async function webResume() {
  const ctx = ensureCtx();
  if (ctx.state !== 'running') await ctx.resume();
  return ctx;
}

function webLoopPurr(volume: number) {
  const ctx = ensureCtx();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator(); // low hum
  const lfo = ctx.createOscillator(); // tremolo
  const lfoGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 55; // ~A1
  lfo.type = 'sine';
  lfo.frequency.value = 2;

  // start with modest tremolo
  gain.gain.value = volume * 0.7;
  lfoGain.gain.value = volume * 0.3;

  lfo.connect(lfoGain).connect(gain.gain);
  osc.connect(gain);

  osc.start();
  lfo.start();

  return { stopAsync: async () => { try { osc.stop(); lfo.stop(); } catch {} }, unloadAsync: async () => {} };
}

function noiseNode(volume: number, centerHz: number, q = 0.8) {
  const ctx = ensureCtx();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(ctx.destination);

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = centerHz;
  bpf.Q.value = q;

  src.connect(bpf).connect(gain);
  src.start();

  return { stopAsync: async () => { try { src.stop(); } catch {} }, unloadAsync: async () => {} };
}

function webOneShotChime(volume: number) {
  const ctx = ensureCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
  return { stopAsync: async () => {}, unloadAsync: async () => {} };
}

// ---------- Public API ----------
export async function playLoop(name: NamedSound, volume = 0.5): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume(); // must be called from a user gesture
    if (sources[name]) {
      // If you add mp3 assets later, this path will play them.
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
        await sound.playAsync();
        return sound;
      } catch { /* fall through to synth */ }
    }
    if (name === 'purr') return webLoopPurr(volume);
    if (name === 'rain') return noiseNode(volume, 1200, 0.9);
    if (name === 'waterfall') return noiseNode(volume, 3000, 0.3);
    return null;
  }

  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: true, volume });
    await sound.playAsync();
    return sound;
  } catch {
    return null;
  }
}

export async function playOneShot(name: NamedSound, volume = 0.7): Promise<SoundLike | null> {
  if (Platform.OS === 'web') {
    await webResume();
    if (name === 'chime') return webOneShotChime(volume);
    if (sources[name]) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: false, volume });
        await sound.playAsync();
        return sound;
      } catch { return null; }
    }
    return null;
  }

  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(sources[name]!, { isLooping: false, volume });
    await sound.playAsync();
    return sound;
  } catch {
    return null;
  }
}

export async function stopAndUnload(sound: any) {
  try {
    if (!sound) return;
    if (typeof sound.stopAsync === 'function') await sound.stopAsync();
    if (typeof sound.unloadAsync === 'function') await sound.unloadAsync();
  } catch {}
}
