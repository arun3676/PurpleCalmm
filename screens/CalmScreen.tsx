import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { useKeepAwake } from 'expo-keep-awake';
import { playOneShot } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Calm'>;

const INHALE_MS = 4000;
const HOLD_MS = 7000;
const EXHALE_MS = 8000;
const TOTAL_CYCLES = 6; // <- change if you want more/less

type Phase = 'inhale' | 'hold' | 'exhale';

export default function CalmScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycle, setCycle] = useState<number>(1);
  const [running, setRunning] = useState(true);
  const [showGrounding, setShowGrounding] = useState(false);

  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>('inhale');
  const cycleRef = useRef<number>(1);
  const runningRef = useRef<boolean>(true);

  const scale = useRef(new Animated.Value(1)).current;

  useKeepAwake();

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    cycleRef.current = cycle;
    if (cycle >= 2) setShowGrounding(true); // reveal after 2 full cycles
  }, [cycle]);

  useEffect(() => {
    runningRef.current = running;
    if (running) scheduleNext(0); // (re)start immediately
    else clearTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    // start on mount
    scheduleNext(0);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearTimer() {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  }

  function animatePhase(p: Phase) {
    // simple scale animation to match breath direction
    const to = p === 'inhale' ? 1.15 : p === 'exhale' ? 0.85 : 1.0;
    const dur = p === 'inhale' ? INHALE_MS : p === 'exhale' ? EXHALE_MS : HOLD_MS;
    Animated.timing(scale, { toValue: to, duration: dur, useNativeDriver: true }).start();
  }

  async function scheduleNext(delay = 0) {
    clearTimer();
    if (!runningRef.current) return;

    const p = phaseRef.current;
    const dur = p === 'inhale' ? INHALE_MS : p === 'hold' ? HOLD_MS : EXHALE_MS;

    animatePhase(p);

    tRef.current = setTimeout(async () => {
      if (!runningRef.current) return;

      // advance phase
      let next: Phase;
      if (p === 'inhale') next = 'hold';
      else if (p === 'hold') next = 'exhale';
      else {
        // exhale ended -> count a full cycle
        const nextCycle = cycleRef.current + 1;
        setCycle(nextCycle);

        if (nextCycle > TOTAL_CYCLES) {
          setRunning(false);
          await playOneShot('chime', 0.5);
          return; // finished
        }
        next = 'inhale';
      }

      setPhase(next);
      await playOneShot('chime', 0.35); // soft cue between phases
      scheduleNext(0);
    }, dur + delay);
  }

  function labelFor(p: Phase) {
    if (p === 'inhale') return 'Inhale';
    if (p === 'hold') return 'Hold';
    return 'Exhale';
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Calm</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>4-7-8 breathing</Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Animated.View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale }],
          }}
        >
          <Text style={[textStyles.h2, { color: colors.text }]}>{labelFor(phase)}</Text>
        </Animated.View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 10 }]}>
          Cycle: {cycle} / {TOTAL_CYCLES}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable
            onPress={() => setRunning((v) => !v)}
            style={{ backgroundColor: colors.primaryDark, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 }}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{running ? 'Pause' : 'Resume'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              clearTimer();
              setPhase('inhale');
              setCycle(1);
              setShowGrounding(false);
              setRunning(true);
              scheduleNext(0);
            }}
            style={{ backgroundColor: colors.surface, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 }}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Restart</Text>
          </Pressable>
        </View>
      </View>

      {/* Grounding appears after 2 full cycles, but breathing continues */}
      {showGrounding && (
        <View style={{ marginTop: 28 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>5-4-3-2-1 Grounding</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>• 5 things you can see</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 4 things you can touch</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 3 things you can hear</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 2 things you can smell</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 1 thing you can taste</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>You’re safe. You’re here. Breathe.</Text>
        </View>
      )}
    </View>
  );
}
