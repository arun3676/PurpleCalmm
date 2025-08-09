import { Platform } from 'react-native';

export async function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }) {
  const { rate = 0.9, pitch = 1.0, volume = 0.9 } = opts || {};
  if (Platform.OS === 'web') {
    try {
      // @ts-ignore
      const synth = window.speechSynthesis as SpeechSynthesis | undefined;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      synth.cancel();
      synth.speak(u);
    } catch {}
    return;
  }
  // Native (optional): will work if expo-speech is installed; otherwise silently no-op
  try {
    const Speech = await import('expo-speech');
    // @ts-ignore
    Speech.speak(text, { rate, pitch, volume });
  } catch {}
}
