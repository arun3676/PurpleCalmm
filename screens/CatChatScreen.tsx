import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { saveEntry } from '../utils/storage';
import { stopAndUnload, playMochiLullaby, playSong, stopAllSongs } from '../utils/audio';
import { askMochi, ChatMsg, loadChat, saveChat, clearCurrentSession } from '../utils/mochiClient';
import { memoryStrings, addMemories, forgetMemories } from '../utils/memory';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../providers/SettingsProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'CatChat'>;

// Version: 2.0 - In-chat reset confirmation (no popups) - Updated: Dec 19 2024

export default function CatChatScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const { setMigraineMinutes } = useSettings();
  const GREETING: ChatMsg = { role:'assistant', content: "Mew! I’m Mochi. Tell me what’s up, I’m listening. 💜" };
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    const prev = loadChat();
    return prev.length ? prev : [GREETING];
  });
  useEffect(() => { saveChat(messages); }, [messages]);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');
  const [thinking, setThinking] = useState(false);
  const [lullaby, setLullaby] = useState<any | null>(null);
  const [softKitty, setSoftKitty] = useState<any | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('CatChatScreen mounted with showResetConfirm:', showResetConfirm);
  }, []);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages.length]);
  useEffect(() => () => { stopAndUnload(lullaby); stopAndUnload(softKitty); }, [lullaby, softKitty]);

  async function handleAction(a: any) {
    switch (a?.action) {
      case 'PLAY_SOFT_KITTY': {
        // No auto-play; user can tap the Soft Kitty button below
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
    const text = input.trim(); if (!text || thinking) return;
    setInput('');
    const next = [...messages, { role:'user', content:text }];
    setMessages(next);
    setThinking(true);
    try {
      const mochi = await askMochi(next.slice(-12), memoryStrings());
      setMessages(m => [...m, { role:'assistant', content: mochi.reply + (mochi.followup ? '\n\n' + mochi.followup : '') }]);
      if (mochi.memoryAdd?.length) addMemories(mochi.memoryAdd);
      if (mochi.memoryForget?.length) forgetMemories(mochi.memoryForget);
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

  function initiateReset() {
    console.log('Initiating reset - should show in-chat confirmation');
    setShowResetConfirm(true);
  }

  function confirmReset() {
    // Clear session storage completely
    clearCurrentSession();
    
    const freshStart = [GREETING];
    setMessages(freshStart);
    saveChat(freshStart);
    setShowResetConfirm(false);
    
    // Add a system message to show reset was successful
    setTimeout(() => {
      setMessages([...freshStart, { 
        role: 'assistant', 
        content: "✨ Chat history has been cleared! I'm here with a fresh start. How can I help you today?" 
      }]);
    }, 500);
  }

  function cancelReset() {
    setShowResetConfirm(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
          </Pressable>
          <Pressable 
            onPress={initiateReset}
            style={({ pressed }) => ({ 
              backgroundColor: pressed ? colors.primaryDark : colors.surface, 
              paddingVertical: 8, 
              paddingHorizontal: 14, 
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.mutedText + '50',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              opacity: pressed ? 0.8 : 1
            })}>
            <Text style={[textStyles.body, { color: colors.text, fontSize: 13, fontWeight: '500' }]}>🗑️ Reset</Text>
          </Pressable>
        </View>
        <Text style={[textStyles.h1, { color: colors.text, marginTop: 8 }]}>Mochi the Cat</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>A gentle place to talk</Text>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {messages.map((m, i) => (
          <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: m.role === 'user' ? colors.primaryDark : colors.surface, padding: 12, borderRadius: 14, marginVertical: 6 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>{m.content}</Text>
          </View>
        ))}
        
        {/* In-chat reset confirmation */}
        {showResetConfirm && (
          <View style={{ 
            backgroundColor: colors.surface, 
            borderRadius: 16, 
            padding: 16, 
            marginVertical: 12,
            borderWidth: 2,
            borderColor: colors.primary + '30',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}>
            <Text style={[textStyles.h3, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}>
              🗑️ Reset Chat History
            </Text>
            <Text style={[textStyles.body, { color: colors.mutedText, textAlign: 'center', marginBottom: 16 }]}>
              This will clear all previous conversations with Mochi. Are you sure?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
              <Pressable 
                onPress={cancelReset}
                style={{ 
                  backgroundColor: colors.surface, 
                  borderWidth: 2,
                  borderColor: colors.mutedText + '40',
                  paddingVertical: 10, 
                  paddingHorizontal: 20, 
                  borderRadius: 12,
                  minWidth: 80,
                  alignItems: 'center'
                }}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={confirmReset}
                style={{ 
                  backgroundColor: '#ff4444', 
                  paddingVertical: 10, 
                  paddingHorizontal: 20, 
                  borderRadius: 12,
                  minWidth: 80,
                  alignItems: 'center'
                }}>
                <Text style={[textStyles.bodyMedium, { color: 'white', fontWeight: '600' }]}>Reset</Text>
              </Pressable>
            </View>
          </View>
        )}
        
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
