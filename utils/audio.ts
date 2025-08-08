import { Audio, AVPlaybackSource, Sound } from 'expo-av';

type NamedSound = 'purr' | 'rain' | 'jazz' | 'chime' | 'ocean' | 'waterfall' | 'alarm';

const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  // Add local assets later if you want richer sounds
  // Example:
  // purr: require('../assets/purr.mp3'),
  // rain: require('../assets/rain.mp3'),
  // waterfall: require('../assets/waterfall.mp3'),
  // chime: require('../assets/chime.mp3')
};

export async function playLoop(name: NamedSound, volume = 0.5): Promise<Sound | null> {
  try {
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
