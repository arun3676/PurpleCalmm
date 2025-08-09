import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import * as Brightness from 'expo-brightness';
import { playSong, stopAndUnload } from '../utils/audio';
import { scheduleIn } from '../utils/notifications';
import PawButton from '../components/PawButton';
import { saveEntry } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Migraine'>;

export default function MigraineScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [meow, setMeow] = useState<any | null>(null);
  const [timer, setTimer] = useState<15 | 30 | 45>(15);
  const [hydration, setHydration] = useState(false);
  const [resetRunning, setResetRunning] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  useEffect(() => {
    (async () => { try { if (Platform.OS !== 'web') await Brightness.setSystemBrightnessAsync(0.02); } catch {} })();
    return () => { stopAndUnload(meow); };
  }, [meow]);

  async function startTimer() {
    if (hydration) await scheduleIn(timer, 'Hydration reminder', 'Sip water to support recovery');
  }

  async function quickNote() {
    await saveEntry({ id: `${Date.now()}`, type: 'migraineNote', note: 'Quick note during migraine', ts: Date.now() });
  }

  // 60-second reset routine (cycles through 4 steps)
  function beginReset() {
    if (resetRunning) return;
    setResetRunning(true); setResetStep(0);
    const id = setInterval(() => {
      setResetStep(s => {
        const n = s + 1;
        if (n >= 4) { clearInterval(id); setResetRunning(false); }
        return n;
      });
    }, 15000);
  }

  const stepText = [
    'Dim lights. Unclench jaw. Shoulders down.',
    'Inhale 4 • Exhale 6 — slow and soft.',
    'Cool pack on neck / warm hands if available.',
    'Close eyes: name 3 sounds, 2 touches, 1 smell.'
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Migraine</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Ultra-dim with gentle sound</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Sound</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Tap to start/stop.</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <PawButton
            label={meow ? '⏸ Mochi Meow' : '▶︎ Mochi Meow'}
            onPress={async () => {
              if (meow) {
                await stopAndUnload(meow);
                setMeow(null);
              } else {
                const s = await playSong('sadmeow', 0.6, true);
                setMeow(s);
              }
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}> 
          • Dim screen and reduce noise.{"\n"}
          • Small sips of water (enable reminder below).{"\n"}
          • Cool pack on neck or warm hands.{"\n"}
          • 4 in / 6 out breathing for 1 min.{"\n"}
          • Sudden new or severe symptoms → seek medical care.
        </Text>
        <Pressable onPress={beginReset} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
          <Text style={[textStyles.body, { color: colors.accent }]}>{resetRunning ? 'Reset running…' : 'Start 60-second Reset ▷'}</Text>
        </Pressable>
        {resetRunning && (
          <View style={{ marginTop: 8, backgroundColor: colors.background, borderRadius: 8, padding: 10 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>{stepText[resetStep]}</Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Timer: </Text>
        {[15, 30, 45].map(v => (
          <Pressable key={v} onPress={() => setTimer(v as 15 | 30 | 45)} style={{ marginHorizontal: 8 }}>
            <Text style={[textStyles.body, { color: v === timer ? colors.accent : colors.mutedText }]}>{v}m</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Switch value={hydration} onValueChange={setHydration} />
        <Text style={[textStyles.body, { color: colors.mutedText, marginLeft: 8 }]}>Hydration reminder</Text>
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
        <PawButton label="Start Timer" onPress={startTimer} />
        <PawButton label="Quick Note" onPress={quickNote} />
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.primaryDarker, opacity: 0.65, pointerEvents: 'none' }} />
    </View>
  );
}
