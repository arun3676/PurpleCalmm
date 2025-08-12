import { Audio, AVPlaybackStatusSuccess } from 'expo-av';

type Key = 'brown' | 'hum' | 'rain';
// Use public-path URIs so the app still bundles if local files are not present yet.
const assets: Record<Key, { uri: string }> = {
  brown: { uri: '/assets/audio/brown.mp3' },
  hum:   { uri: '/assets/audio/hum.mp3' },
  rain:  { uri: '/assets/audio/rain.mp3' },
};

let currentKey: Key | null = null;
let current: Audio.Sound | null = null;
let next: Audio.Sound | null = null;

// ensure Audio configured once
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

async function load(key: Key) {
  const sound = new Audio.Sound();
  await sound.loadAsync(assets[key], { volume: 0.0, isLooping: true }, true);
  return sound;
}

export async function playOrCrossfade(key: Key, fadeMs = 250) {
  if (currentKey === key && current) {
    // already playing this
    return;
  }
  // prepare next
  next = await load(key);
  await next.playAsync();

  // fade next in & current out
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const vIn  = i / steps;
    const vOut = 1 - vIn;
    await next.setStatusAsync({ volume: vIn });
    if (current) await current.setStatusAsync({ volume: vOut });
    await new Promise(r => setTimeout(r, fadeMs / steps));
  }
  // stop & unload previous
  if (current) { try { await current.stopAsync(); } catch {} try { await current.unloadAsync(); } catch {} }
  current = next; currentKey = key; next = null;
}

export async function stopAll(fadeMs = 250) {
  if (!current) return;
  const status = await current.getStatusAsync() as AVPlaybackStatusSuccess;
  if (!status.isLoaded) return;
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const v = 1 - i / steps;
    await current.setStatusAsync({ volume: v });
    await new Promise(r => setTimeout(r, fadeMs / steps));
  }
  try { await current.stopAsync(); } catch {}
  try { await current.unloadAsync(); } catch {}
  current = null; currentKey = null;
}

export function getCurrentKey(): Key | null { return currentKey; }


