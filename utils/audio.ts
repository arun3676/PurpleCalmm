import { Audio, AVPlaybackSource, Sound } from 'expo-av';
import { Platform } from 'react-native';

type NamedSound = 'purr' | 'rain' | 'jazz' | 'chime' | 'ocean' | 'waterfall' | 'alarm';

let webUnlocked = Platform.OS !== 'web';

// Remote, lightweight ambient samples
const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  purr: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/purr.mp3' },
  rain: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/rain.mp3' },
  waterfall: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/waterfall.mp3' },
  chime: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/chime.mp3' }
};

async function ensureUnlocked() {
  if (webUnlocked) return true;
  try {
    // Create a silent sound to satisfy gesture policy, called from button/press handlers
    const { sound } = await Audio.Sound.createAsync(undefined, { volume: 0 });
    await sound.unloadAsync();
    webUnlocked = true;
    return true;
  } catch {
    return false;
  }
}

export async function playLoop(name: NamedSound, volume = 0.5): Promise<Sound | null> {
  try {
    const ok = await ensureUnlocked();
    if (!ok) return null;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const src = sources[name];
    const { sound } = await Audio.Sound.createAsync(src ?? undefined, { isLooping: true, volume });
    await sound.playAsync();
    return sound;
  } catch {
    return null;
  }
}

export async function playOneShot(name: NamedSound, volume = 0.7): Promise<Sound | null> {
  try {
    const ok = await ensureUnlocked();
    if (!ok) return null;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const src = sources[name];
    const { sound } = await Audio.Sound.createAsync(src ?? undefined, { isLooping: false, volume });
    await sound.playAsync();
    return sound;
  } catch {
    return null;
  }
}

export async function stopAndUnload(sound: Sound | null | undefined) {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  } catch {}
}
