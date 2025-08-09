import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { useKeepAwake } from 'expo-keep-awake';
import { playOneShot } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Calm'>;

const INHALE_MS = 4000, HOLD_MS = 7000, EXHALE_MS = 8000;
const TOTAL_CYCLES = 6;

type Phase = 'inhale'|'hold'|'exhale';

export default function CalmScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [remaining, setRemaining] = useState(INHALE_MS);
  const [cycle, setCycle] = useState(1);
  const [showGrounding, setShowGrounding] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);
  const scale = useRef(new Animated.Value(1)).current;

  useKeepAwake();

  useEffect(() => { startPhase('inhale'); return stopTimer; }, []);

  useEffect(() => { if (cycle >= 2) setShowGrounding(true); }, [cycle]);

  function stopTimer() { if (timer.current) { clearInterval(timer.current); timer.current = null; } }

  function startPhase(p: Phase) {
    stopTimer();
    setPhase(p);
    const dur = p==='inhale' ? INHALE_MS : p==='hold' ? HOLD_MS : EXHALE_MS;
    setRemaining(dur);
    Animated.timing(scale, { toValue: p==='inhale'?1.18:p==='exhale'?0.85:1.0, duration: dur, useNativeDriver: true }).start();

    const start = Date.now();
    timer.current = setInterval(async () => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, dur - elapsed);
      setRemaining(left);
      if (left <= 0) {
        stopTimer();
        await playOneShot('chime', 0.33);
        if (p === 'exhale') setCycle(c => c + 1);
        const next: Phase = p==='inhale' ? 'hold' : p==='hold' ? 'exhale' : 'inhale';
        startPhase(next);
      }
    }, 100);
  }

  const sec = Math.ceil(remaining/1000);
  const label = phase==='inhale' ? 'Inhale' : phase==='hold' ? 'Hold' : 'Exhale';
  const bubbleColor = phase==='inhale' ? colors.primary : phase==='hold' ? colors.surface : colors.primaryDark;

  return (
    <View style={{ flex:1, backgroundColor: colors.background, padding:16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems:'center', marginTop:24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Calm</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop:4 }]}>4-7-8 breathing</Text>
      </View>

      <View style={{ alignItems:'center', marginTop:24 }}>
        <Animated.View style={{
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: bubbleColor, alignItems:'center', justifyContent:'center',
          transform:[{ scale }]
        }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>{label}</Text>
          <Text style={[textStyles.body, { color: colors.text, marginTop:6 }]}>{sec}s</Text>
        </Animated.View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop:10 }]}>Cycle: {cycle} / {TOTAL_CYCLES}</Text>
      </View>

      {showGrounding && (
        <View style={{ marginTop: 28 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>5-4-3-2-1 Grounding</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>• 5 things you can see</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 4 things you can touch</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 3 things you can hear</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 2 things you can smell</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>• 1 thing you can taste</Text>
        </View>
      )}
    </View>
  );
}
