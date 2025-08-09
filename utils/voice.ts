import { Platform } from 'react-native';

function pickWebVoice(lang?: string) {
  const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
  if (!synth) return null;
  const choose = () => {
    const list = synth.getVoices() || [];
    if (lang) {
      const m = list.find(v => (v as any).lang?.toLowerCase().startsWith(lang.toLowerCase()));
      if (m) return m;
    }
    return list[0] || null;
  };
  const v = choose();
  if (v) return v;
  // voices may load async
  return null;
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number; lang?: string }) {
  const { rate = 0.92, pitch = 1.1, volume = 0.9, lang } = opts || {};
  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
      if (!synth) return;
      const say = () => {
        const u = new SpeechSynthesisUtterance(text);
        const voice = pickWebVoice(lang || 'ko'); // prefer Korean
        if (voice) (u as any).voice = voice;
        u.rate = rate; u.pitch = pitch; u.volume = volume;
        synth.cancel(); synth.speak(u);
      };
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) {
        synth.onvoiceschanged = () => { say(); synth.onvoiceschanged = null as any; };
      } else say();
    } catch {}
    return;
  }
  // Native (optional): works if expo-speech is installed; otherwise no-op
  try {
    const Speech = await import('expo-speech');
    // @ts-ignore
    Speech.speak(text, { rate, pitch, volume, language: lang || 'ko-KR' });
  } catch {}
}
