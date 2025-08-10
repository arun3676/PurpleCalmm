import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import Card from '../components/Card';
import CatAvatar from '../components/CatAvatar';
import PawButton from '../components/PawButton';
import PawRow from '../components/PawRow';
import CatHero from '../components/CatHero';
import CuddleAura from '../components/CuddleAura';
import { calcJournalStreak, loadEntries, loadStickers } from '../utils/storage';
import { selection } from '../utils/haptics';
import { playLoop, stopAndUnload, resumeAll } from '../utils/audio';
import type { Sound } from 'expo-av';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, vibe } = useAppTheme();
  const [streak, setStreak] = useState(0);
  const [cuddling, setCuddling] = useState(false);
  const [purr, setPurr] = useState<Sound | any | null>(null);
  const [stickers, setStickers] = useState<{ id: string; name: string; emoji: string; ts: number }[]>([]);

  useEffect(() => {
    (async () => {
      const entries = await loadEntries();
      setStreak(calcJournalStreak(entries));
      setStickers(await loadStickers());
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
      <CatHero />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 }}>
        <View>
          <Text style={[textStyles.h1, { color: colors.text }]}>Purrple Calm</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>{vibe ? 'V-inspired vibe: ON 🎷💜' : 'Vibe: Classic Purple'}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} accessibilityLabel="Open settings">
          <Text style={[textStyles.bodyMedium, { color: colors.accent }]}>⚙️</Text>
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
          <CuddleAura active={cuddling} />
          <Pressable onPressIn={onCatPressIn} onPressOut={onCatPressOut} hitSlop={20}>
            <CatAvatar moodLevel={Math.min(1, streak / 7)} size={140} />
          </Pressable>
        </View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>
          {cuddling ? 'Purring… 💜💜💜' : `Journal streak: ${streak} day${streak === 1 ? '' : 's'}`}
        </Text>
        {!cuddling && <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 2 }]}>Tap & hold the cat to cuddle</Text>}
      </View>

      {/* Paw Stickers Drawer */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 12, marginBottom: 12 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Paw Stickers</Text>
        {stickers.length === 0 ? (
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}>Complete a Calm breathing set to earn your first sticker!</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8, marginTop: 8 }}>
            {stickers.slice(0, 12).map(s => (
              <View key={s.id} style={{ backgroundColor: colors.primaryDark, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>{s.emoji} {s.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <PawRow />

      <Card title="Cat Chat" subtitle="Talk to Mochi when anxious" onPress={() => navigation.navigate('CatChat')} />

      <Card title="Calm" subtitle="4-4-4 breathing" onPress={() => navigation.navigate('Calm')} />
      <Card title="Sleep" subtitle="Wind-down, bedside mode, gentle alarm" onPress={() => navigation.navigate('Sleep')} />
      <Card title="Migraine" subtitle="Ultra-dim, soothing sounds, timer" onPress={() => navigation.navigate('Migraine')} />
      <Card title="Journal" subtitle="3-tap micro-log + trends" onPress={() => navigation.navigate('Journal')} right={<PawButton label="Trends" small onPress={() => navigation.navigate('JournalTrends')} />} />
    </ScrollView>
  );
}
