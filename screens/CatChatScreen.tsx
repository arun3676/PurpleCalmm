import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { saveEntry } from '../utils/storage';
import { CAT_SYSTEM_PROMPT } from '../utils/catPrompt';
import { playLoop, stopAndUnload, playOneShot, playMochiLullaby } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'CatChat'>;

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

export default function CatChatScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'system', content: CAT_SYSTEM_PROMPT },
    { role: 'assistant', content: "Hi, I'm Mochi. Tell me what's on your mind, I’m listening. 💜" }
  ]);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [lullaby, setLullaby] = useState<any | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs.length]);

  useEffect(() => {
    return () => { stopAndUnload(lullaby); };
  }, [lullaby]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    // Intercept "soft kitty" style requests
    if (/soft\s*kitty/i.test(text) || (/sing/i.test(text) && /kitty/i.test(text))) {
      await stopAndUnload(lullaby);
      const reply =
        "I can’t sing that exact song, but I’ll sing you my own.\n" +
        "Here’s *Mochi’s Cozy Lullaby*:\n\n" +
        "Slow little heart, soft and steady.\n" +
        "Warm cozy paws—I’m right here, ready.\n" +
        "Close your eyes; breathe in the night.\n" +
        "Purr-purr rest now; you’re safe and light. 💜";
      setMsgs(m => [...m, { role: 'user', content: text }, { role: 'assistant', content: reply }]);
      const node = await playMochiLullaby(0.38);
      setLullaby(node);
      return;
    }

    const newMsgs = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const res = await fetch('/api/cat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: newMsgs.slice(-12) }) });
      if (!res.ok) throw new Error('server');
      const data = await res.json();
      setMsgs(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      const reply = localFallback(text);
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    const body = note.trim();
    if (!body) {
      Alert.alert('Add a note', 'Write something in the note box first.');
      return;
    }
    await saveEntry({ id: `${Date.now()}`, type: 'journal', mood: 'ok', tags: ['chat'], note: body, ts: Date.now() });
    setNote('');
    if (Platform.OS === 'web') alert('Saved to Journal!');
    navigation.navigate('Home');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
        </Pressable>
        <Text style={[textStyles.h1, { color: colors.text, marginTop: 8 }]}>Mochi the Cat</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>A gentle place to talk</Text>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {msgs.filter(m => m.role !== 'system').map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: m.role === 'user' ? colors.primaryDark : colors.surface, padding: 12, borderRadius: 14, marginVertical: 6 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>{m.content}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator style={{ marginTop: 8 }} color={colors.primary} />}
      </ScrollView>

      {lullaby && (
        <Pressable
          onPress={async () => { await stopAndUnload(lullaby); setLullaby(null); }}
          style={{ alignSelf: 'center', marginBottom: 8, backgroundColor: colors.surface, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 }}
        >
          <Text style={[textStyles.body, { color: colors.mutedText }]}>🔈 Lullaby playing — Tap to stop</Text>
        </Pressable>
      )}

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#00000033' }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tell Mochi anything…"
            placeholderTextColor={colors.mutedText}
            style={{ flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}
          />
          <Pressable onPress={send} style={{ backgroundColor: colors.primaryDark, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Send</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[textStyles.h3, { color: colors.text, marginBottom: 6 }]}>Notes for later</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="A takeaway to remember…"
            placeholderTextColor={colors.mutedText}
            multiline
            style={{ minHeight: 60, backgroundColor: colors.surface, color: colors.text, borderRadius: 12, padding: 12 }}
          />
          <Pressable onPress={saveNote} style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.primaryDark, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Save to Journal 🐾</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function localFallback(user: string) {
  const s = user.toLowerCase();
  if (s.includes('panic') || s.includes('anxiety')) {
    return "That sounds scary. You’re not alone.\nTry this with me:\n• Inhale 4\n• Hold 4\n• Exhale 6 (soft shoulders)\n• Name 3 things you see\nI’m here. 🐾";
  }
  if (s.includes('sleep paralysis')) {
    return "Sleep paralysis feels awful—but it passes.\nGently wiggle toes or tongue, slow exhale.\nRemind yourself: 'My body is safe; this will pass.'";
  }
  if (s.includes('migraine')) {
    return "Lights low, hydrate small sips.\nTry a cool pack on neck, breathe 4–6.\nAvoid screens if you can.\nIf symptoms change suddenly, seek medical care.";
  }
  return "I’m listening. Tell me a bit more.\nWhat’s the feeling in your body right now?";
}
