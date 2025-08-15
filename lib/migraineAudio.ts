import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import { Platform } from 'react-native';

type Key = 'brown' | 'hum' | 'rain' | 'sadmeow';

// Use local assets for available files, web generated for others
const localAssets = {
  sadmeow: require('../assets/sad_meow.mp3'),
};

const assets: Record<Key, { uri: string } | any> = {
  brown: { uri: '/assets/audio/brown.mp3' }, // Will be generated for web
  hum:   { uri: '/assets/audio/hum.mp3' },   // Will be generated for web
  rain:  { uri: '/assets/audio/rain.mp3' },  // Will be generated for web
  sadmeow: localAssets.sadmeow,
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

// Web audio generation for missing sounds
function generateWebAudio(key: Key): any {
  if (Platform.OS !== 'web') return null;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds of audio
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    switch (key) {
      case 'brown':
        // Generate brown noise
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const brown = (lastOut + (0.02 * white)) / 1.02;
          lastOut = brown;
          data[i] = brown * 0.3;
        }
        break;
        
      case 'hum':
        // Generate soft humming tone
        for (let i = 0; i < bufferSize; i++) {
          const t = i / audioContext.sampleRate;
          data[i] = Math.sin(2 * Math.PI * 60 * t) * 0.1 + // 60Hz base
                    Math.sin(2 * Math.PI * 120 * t) * 0.05; // 120Hz harmonic
        }
        break;
        
      case 'rain':
        // Generate rain-like noise
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }
        break;
    }
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioContext.destination);
    
    let source: AudioBufferSourceNode | null = null;
    let isPlaying = false;
    
    // Create a wrapper that mimics Audio.Sound interface
    return {
      playAsync: async () => {
        if (isPlaying) return;
        source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        isPlaying = true;
      },
      stopAsync: async () => {
        if (source && isPlaying) {
          source.stop();
          source.disconnect();
          source = null;
          isPlaying = false;
        }
      },
      unloadAsync: async () => {
        if (source && isPlaying) {
          source.stop();
          source.disconnect();
          source = null;
        }
        isPlaying = false;
      },
      setStatusAsync: async (status: any) => {
        if (status.volume !== undefined) {
          gainNode.gain.value = status.volume;
        }
      },
      getStatusAsync: async () => ({ 
        isLoaded: true, 
        volume: gainNode.gain.value,
        isPlaying: isPlaying 
      }),
    };
  } catch (error) {
    console.warn(`Failed to generate web audio for ${key}:`, error);
    return null;
  }
}

async function load(key: Key) {
  // For sadmeow, use the actual file
  if (key === 'sadmeow') {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(assets[key], { volume: 0.0, isLooping: true }, true);
      return sound;
    } catch (error) {
      console.warn(`Failed to load sadmeow audio:`, error);
      return null;
    }
  }
  
  // For web and missing audio files, generate audio
  if (Platform.OS === 'web' && ['brown', 'hum', 'rain'].includes(key)) {
    const webSource = generateWebAudio(key as 'brown' | 'hum' | 'rain');
    if (webSource) {
      return webSource;
    }
  }
  
  // Fallback to trying to load from assets for other platforms
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync(assets[key], { volume: 0.0, isLooping: true }, true);
    return sound;
  } catch (error) {
    console.warn(`Failed to load audio for ${key}:`, error);
    return null;
  }
}

export async function playOrCrossfade(key: Key, fadeMs = 250) {
  if (currentKey === key && current) {
    // already playing this
    return;
  }
  
  // prepare next
  next = await load(key);
  if (!next) {
    console.warn(`Failed to load audio for ${key}`);
    return;
  }
  
  try {
    await next.playAsync();
  } catch (error) {
    console.warn(`Failed to play audio for ${key}:`, error);
    return;
  }

  // fade next in & current out
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const vIn  = i / steps;
    const vOut = 1 - vIn;
    try {
      if (next) await next.setStatusAsync({ volume: vIn });
      if (current) await current.setStatusAsync({ volume: vOut });
    } catch (error) {
      console.warn('Volume control error:', error);
    }
    await new Promise(r => setTimeout(r, fadeMs / steps));
  }
  
  // stop & unload previous
  if (current) { 
    try { await current.stopAsync(); } catch {} 
    try { await current.unloadAsync(); } catch {} 
  }
  
  current = next; 
  currentKey = key; 
  next = null;
}

export async function stopAll(fadeMs = 250) {
  if (!current) return;
  
  try {
    const status = await current.getStatusAsync();
    if (!status || !status.isLoaded) {
      // If we can't get status, just stop directly
      try { await current.stopAsync(); } catch {}
      try { await current.unloadAsync(); } catch {}
      current = null; 
      currentKey = null;
      return;
    }
    
    // Fade out
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const v = 1 - i / steps;
      try {
        await current.setStatusAsync({ volume: v });
      } catch (error) {
        console.warn('Volume fade error:', error);
        break; // Skip fade and go straight to stop
      }
      await new Promise(r => setTimeout(r, fadeMs / steps));
    }
  } catch (error) {
    console.warn('Error during audio fade:', error);
  }
  
  // Stop and unload
  try { await current.stopAsync(); } catch {}
  try { await current.unloadAsync(); } catch {}
  current = null; 
  currentKey = null;
}

export function getCurrentKey(): Key | null { return currentKey; }


