import { Platform } from 'react-native';

function pickWebVoice(lang?: string) {
  const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
  if (!synth) return null;
  const list = synth.getVoices?.() || [];
  const m = list.find(v => (v as any).lang?.toLowerCase().startsWith((lang||'').toLowerCase()));
  return m || list[0] || null;
}

function bestKoVoice(): SpeechSynthesisVoice | null {
  const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
  if (!synth) return null;
  const voices = synth.getVoices?.() || [];
  const prefer = ['Natural', 'Neural', 'WaveNet', 'Google 한국의', 'Microsoft'];
  const ko = voices.filter(v => (v as any).lang?.toLowerCase().startsWith('ko'));
  for (const tag of prefer) {
    const pick = ko.find(v => (v.name || '').includes(tag));
    if (pick) return pick as any;
  }
  return (ko[0] as any) || null;
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number; lang?: string }) {
  const { rate = 0.92, pitch = 1.1, volume = 0.9, lang } = opts || {};
  if (Platform.OS === 'web') {
    const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) return;
    const say = () => {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickWebVoice(lang || 'ko-KR');
      if (v) (u as any).voice = v;
      u.rate = rate; u.pitch = pitch; u.volume = volume;
      synth.cancel(); synth.speak(u);
    };
    const voices = synth.getVoices?.() || [];
    if (voices.length === 0) synth.onvoiceschanged = () => { say(); synth.onvoiceschanged = null as any; };
    else say();
    return;
  }
  try {
    const Speech = await import('expo-speech');
    // @ts-ignore
    Speech.speak(text, { rate, pitch, volume, language: (opts?.lang || 'ko-KR') });
  } catch {}
}

export async function speakSequence(lines: string[], opts?: { rate?: number; pitch?: number; volume?: number; lang?: string, gapMs?: number }) {
  const gap = opts?.gapMs ?? 300;
  for (const line of lines) {
    await new Promise<void>(res => {
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; setTimeout(res, gap); } };
      if (Platform.OS === 'web') {
        const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
        if (!synth) return res(); // no voice available
        const u = new SpeechSynthesisUtterance(line);
        const v = pickWebVoice(opts?.lang || 'ko-KR');
        if (v) (u as any).voice = v;
        u.rate = opts?.rate ?? 0.9; u.pitch = opts?.pitch ?? 1.12; u.volume = opts?.volume ?? 0.95;
        u.onend = done; u.onerror = done;
        synth.speak(u);
      } else {
        (async () => { try {
          const Speech = await import('expo-speech');
          // @ts-ignore
          Speech.speak(line, { rate: opts?.rate ?? 0.9, pitch: opts?.pitch ?? 1.12, volume: opts?.volume ?? 0.95, language: opts?.lang || 'ko-KR', onDone: done, onError: done });
        } catch { done(); } })();
      }
    });
  }
}

export async function speakGoodnightKoCute() {
  const lines = ['잘 자요…', '좋은 꿈 꿔요…', '제가 옆에 있어요.'];
  if (Platform.OS === 'web') {
    const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) return;

    const say = (text: string) => {
      const u = new SpeechSynthesisUtterance(text);
      const v = bestKoVoice(); if (v) (u as any).voice = v;
      u.rate = 0.85; u.pitch = 1.03; u.volume = 0.92;
      synth.speak(u);
      return new Promise<void>(res => { u.onend = () => setTimeout(res, 280); u.onerror = () => setTimeout(res, 280); });
    };

    if (!synth.getVoices || synth.getVoices().length === 0) {
      await new Promise<void>(res => { synth.onvoiceschanged = () => { synth.onvoiceschanged = null as any; res(); }; });
    }
    for (const l of lines) await say(l);
    return;
  }
  try {
    const Speech = await import('expo-speech');
    // @ts-ignore
    for (const l of lines) { await new Promise<void>(res => { Speech.speak(l, { language: 'ko-KR', rate: 0.85, pitch: 1.03, onDone: () => setTimeout(res, 280), onError: () => setTimeout(res, 280) }); }); }
  } catch {}
}
