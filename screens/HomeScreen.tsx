import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Animated } from 'react-native';
import BlendHero from '../components/BlendHero';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import Card from '../components/Card';
import CatAvatar from '../components/CatAvatar';
import PawButton from '../components/PawButton';
import PawRow from '../components/PawRow';
// Removed CatHero background header per request
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
  const hugScale = useRef(new Animated.Value(1)).current;

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
    try { resumeAll(); } catch {}
    Animated.spring(hugScale, { toValue: 1.08, useNativeDriver: false, friction: 6, tension: 120 }).start();
    selection();
    const s = await playLoop('softpurr', 0.28);
    setPurr(s);
  }
  async function onCatPressOut() {
    setCuddling(false);
    Animated.spring(hugScale, { toValue: 1, useNativeDriver: false, friction: 6, tension: 120 }).start();
    await stopAndUnload(purr);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <BlendHero
        src={'/assets/splash_cat.jpeg'}
        focus={{ xPct: 60, yPct: 64 }}
        height={260}
        overlay="rgba(237,230,255,0.42)"
        blurPx={1.2}
        fadeStop={0.68}
      />
      <View
        style={{
          alignSelf: 'center',
          marginTop: -200,
          backgroundColor: 'rgba(255,255,255,0.68)',
          borderColor: '#CFC0FF',
          borderWidth: 1,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 20,
          ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(6px)' } as any) : null),
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#190F2A', textAlign: 'center' }}>Purrple Calm</Text>
        <Text style={{ fontSize: 16, color: '#574A79', textAlign: 'center' }}>Your cozy cat comfort space</Text>
      </View>

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
          <Pressable onPressIn={() => { resumeAll(); onCatPressIn(); }} onPressOut={onCatPressOut} hitSlop={20}>
            <Animated.View style={{ transform: [{ scale: hugScale }] }}>
              <CatAvatar moodLevel={Math.min(1, streak / 7)} size={140} />
            </Animated.View>
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
