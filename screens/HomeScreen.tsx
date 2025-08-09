import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import Card from '../components/Card';
import CatAvatar from '../components/CatAvatar';
import PawButton from '../components/PawButton';
import { calcJournalStreak, loadEntries } from '../utils/storage';
import { soft, selection } from '../utils/haptics';
import { playLoop, stopAndUnload, resumeAll } from '../utils/audio';
import type { Sound } from 'expo-av';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, vibe } = useAppTheme();
  const [streak, setStreak] = useState(0);
  const [cuddling, setCuddling] = useState(false);
  const [purr, setPurr] = useState<Sound | any | null>(null);

  useEffect(() => {
    (async () => {
      const entries = await loadEntries();
      setStreak(calcJournalStreak(entries));
    })();
    return () => { stopAndUnload(purr); };
  }, [purr]);

  async function onCatPressIn() {
    setCuddling(true);
    selection();
    await resumeAll();
    const s = await playLoop('softpurr', 0.28);
    setPurr(s);
  }
  async function onCatPressOut() {
    setCuddling(false);
    await stopAndUnload(purr);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View>
          <Text style={[textStyles.h1, { color: colors.text }]}>Purrple Calm</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>{vibe ? 'V-inspired vibe: ON 🎷💜' : 'Vibe: Classic Purple'}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} accessibilityLabel="Open settings">
          <Text style={[textStyles.bodyMedium, { color: colors.accent }]}>⚙️</Text>
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Pressable onPressIn={onCatPressIn} onPressOut={onCatPressOut} hitSlop={20}>
          <CatAvatar moodLevel={Math.min(1, streak / 7)} size={140} />
        </Pressable>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>
          {cuddling ? 'Purring… 💜💜💜' : `Journal streak: ${streak} day${streak === 1 ? '' : 's'}`}
        </Text>
        {!cuddling && <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 2 }]}>Tap & hold the cat to cuddle</Text>}
      </View>

      <Card title="Cat Chat" subtitle="Talk to Mochi when anxious" onPress={() => navigation.navigate('CatChat')} />

      <Card title="Calm" subtitle="4-4-4 breathing" onPress={() => navigation.navigate('Calm')} />
      <Card title="Sleep" subtitle="Wind-down, bedside mode, gentle alarm" onPress={() => navigation.navigate('Sleep')} />
      <Card title="Migraine" subtitle="Ultra-dim, soothing sounds, timer" onPress={() => navigation.navigate('Migraine')} />
      <Card title="Journal" subtitle="3-tap micro-log + trends" onPress={() => navigation.navigate('Journal')} right={<PawButton label="Trends" small onPress={() => navigation.navigate('JournalTrends')} />} />
    </ScrollView>
  );
}
