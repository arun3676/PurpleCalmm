import { Audio, AVPlaybackSource, Sound } from 'expo-av';

type NamedSound = 'purr' | 'rain' | 'jazz' | 'chime' | 'ocean' | 'waterfall' | 'alarm';

// Remote, lightweight ambient samples to make the app audible without bundling assets.
// You can later replace any of these with local files via require('../assets/xxx.mp3').
const sources: Partial<Record<NamedSound, AVPlaybackSource>> = {
  purr: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/purr.mp3' },
  rain: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/rain.mp3' },
  waterfall: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/waterfall.mp3' },
  chime: { uri: 'https://cdn.jsdelivr.net/gh/purrplecalm/cdn@main/audio/chime.mp3' }
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
