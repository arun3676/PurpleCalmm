import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import PawButton from '../components/PawButton';
import { loadEntries, saveEntry, Entry, deleteEntry, clearJournal } from '../utils/storage';
import { success, selection } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

export default function JournalScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [mood, setMood] = useState<'low' | 'ok' | 'good' | 'great' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [recent, setRecent] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const all = await loadEntries();
      setRecent(all.filter(e => e.type === 'journal').slice(0, 20));
    })();
  }, []);

  function toggleTag(t: string) {
    selection();
    if (tags.includes(t)) setTags(tags.filter(x => x !== t));
    else setTags([...tags, t]);
  }

  async function save() {
    const entry: Entry = {
      id: `${Date.now()}`,
      type: 'journal',
      mood: mood ?? 'ok',
      tags,
      note,
      ts: Date.now()
    };
    await saveEntry(entry);
    setNote('');
    setRecent(prev => [entry, ...prev].slice(0, 20));
    await success();
    if (Platform.OS === 'web') alert('Saved!');
    // Stay on page
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Journal</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>3-tap micro-log</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Mood</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          {(['low', 'ok', 'good', 'great'] as const).map(m => (
            <Pressable key={m} onPress={() => setMood(m)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: mood === m ? colors.primaryDark : colors.surface }}>
              <Text style={[textStyles.body, { color: colors.text }]}>{m === 'low' ? '😔' : m === 'ok' ? '🙂' : m === 'good' ? '😊' : '😸'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Tags</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' as const }}>
          {['work', 'rest', 'friend', 'outside', 'creative', 'pain'].map(t => (
            <Pressable key={t} onPress={() => toggleTag(t)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: tags.includes(t) ? colors.primaryDark : colors.surface }}>
              <Text style={[textStyles.body, { color: colors.text }]}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Note</Text>
        <TextInput
          placeholder="One sentence…"
          placeholderTextColor={colors.mutedText}
          value={note}
          onChangeText={setNote}
          style={{ backgroundColor: colors.surface, color: colors.text, borderRadius: 12, padding: 12 }}
        />
      </View>

      <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
        <PawButton label="Save" onPress={save} />
        <PawButton label="Trends" onPress={() => navigation.navigate('JournalTrends')} />
      </View>

      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Recent notes</Text>
          {recent.length > 0 && (
            <Pressable onPress={async () => {
              const next = await clearJournal();
              setRecent([]);
            }}>
              <Text style={[textStyles.body, { color: colors.accent }]}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {recent.length === 0 ? (
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}>Notes you save will show up here.</Text>
        ) : (
          <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
            {recent.map((e, i) => (
              <View key={e.id} style={{ marginBottom: i === recent.length - 1 ? 0 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { color: colors.text }]}>{`• ${e.note?.trim() || '(no text)'}`}</Text>
                  <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 2 }]}>
                    {new Date(e.ts).toLocaleString()} · mood: {e.mood ?? 'ok'} {e.tags?.length ? `· ${e.tags.join(', ')}` : ''}
                  </Text>
                </View>
                <Pressable onPress={async () => {
                  const next = await deleteEntry(e.id);
                  setRecent(next.filter(x => x.type === 'journal').slice(0, 20));
                }}>
                  <Text style={[textStyles.body, { color: colors.accent }]}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
