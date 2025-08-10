import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { saveEntry } from '../utils/storage';
import { stopAndUnload, playMochiLullaby, playSong, stopAllSongs } from '../utils/audio';
import { askMochi, ChatMsg } from '../utils/mochiClient';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../providers/SettingsProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'CatChat'>;

export default function CatChatScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { setMigraineMinutes } = useSettings();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role:'assistant', content: "Mew! I’m Mochi. Tell me what’s up, I’m listening. 💜" }
  ]);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');
  const [thinking, setThinking] = useState(false);
  const [lullaby, setLullaby] = useState<any | null>(null);
  const [softKitty, setSoftKitty] = useState<any | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages.length]);
  useEffect(() => () => { stopAndUnload(lullaby); stopAndUnload(softKitty); }, [lullaby, softKitty]);

  async function handleAction(a: any) {
    switch (a?.action) {
      case 'PLAY_SOFT_KITTY': {
        if (softKitty) { await stopAndUnload(softKitty); setSoftKitty(null); }
        else { const s = await playSong('softkitty', 0.8, false); setSoftKitty(s); }
        break;
      }
      case 'START_BREATHING':
        nav.navigate('Calm'); break;
      case 'START_MIGRAINE_TIMER': {
        const mins = Math.max(1, Math.min(120, Math.floor(a?.minutes || 10)));
        await setMigraineMinutes(mins);
        // pass param to autostart
        // @ts-ignore
        nav.navigate('Migraine', { autoStart: true, minutes: mins });
        break;
      }
      case 'START_SLEEP':
        nav.navigate('Sleep'); break;
      case 'SAVE_JOURNAL':
        if (a?.journal) {
          try {
            const prev = JSON.parse(localStorage.getItem('purr.journal') || '[]');
            prev.push({ ts: Date.now(), note: String(a.journal) });
            localStorage.setItem('purr.journal', JSON.stringify(prev));
          } catch {}
        }
        break;
      default: break;
    }
  }

  async function onSend() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    const next = [...messages, { role:'user', content: text }];
    setMessages(next);
    setThinking(true);
    try {
      const mochi = await askMochi(next);
      setMessages(m => [...m, {
        role:'assistant',
        content: mochi.reply + (mochi.followup ? '\n\n' + mochi.followup : '')
      }]);
      if (typeof handleAction === 'function') { await handleAction(mochi); }
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content: "Mew… I couldn’t reach the cloud. Tap to retry." }]);
    } finally {
      setThinking(false);
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
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: m.role === 'user' ? colors.primaryDark : colors.surface, padding: 12, borderRadius: 14, marginVertical: 6 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>{m.content}</Text>
          </View>
        ))}
        {thinking && <ActivityIndicator style={{ marginTop: 8 }} color={colors.primary} />}
      </ScrollView>

      <View style={{ flexDirection:'row', justifyContent:'center', marginBottom:8 }}>
        <Pressable
          onPress={async () => {
            if (softKitty) { await stopAndUnload(softKitty); setSoftKitty(null); }
            else { const s = await playSong('softkitty', 0.7, false); setSoftKitty(s); }
          }}
          style={{ backgroundColor: colors.surface, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 }}
        >
          <Text style={[textStyles.body, { color: colors.text }]}>{softKitty ? '⏸ Soft Kitty' : '▶︎ Soft Kitty'}</Text>
        </Pressable>
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#00000033' }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tell Mochi anything…"
            placeholderTextColor={colors.mutedText}
            style={{ flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}
          />
          <Pressable onPress={onSend} style={{ backgroundColor: colors.primaryDark, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
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
