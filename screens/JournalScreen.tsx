import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import PawButton from '../components/PawButton';
import { saveEntry } from '../utils/storage';
import { success, selection } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

export default function JournalScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [mood, setMood] = useState<'low' | 'ok' | 'good' | 'great' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  function toggleTag(t: string) {
    selection();
    if (tags.includes(t)) setTags(tags.filter(x => x !== t));
    else setTags([...tags, t]);
  }

  async function save() {
    await saveEntry({
      id: `${Date.now()}`,
      type: 'journal',
      mood: mood ?? 'ok',
      tags,
      note,
      ts: Date.now()
    });
    await success();
    if (Platform.OS === 'web') alert('Saved!');
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
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
    </View>
  );
}
