import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { useKeepAwake } from 'expo-keep-awake';
import { playOneShot } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Calm'>;

const PHASE_MS = 4000; // inhale 4s, hold 4s, exhale 4s
type Phase = 'inhale'|'hold'|'exhale';

export default function CalmScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [remaining, setRemaining] = useState(PHASE_MS);
  const [cycleInSet, setCycleInSet] = useState(1); // 1..4
  const [setCount, setSetCount] = useState(1);
  const [celebrate, setCelebrate] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const confetti = useRef(new Animated.Value(0)).current;

  useKeepAwake();

  useEffect(() => { startPhase('inhale'); return stopTimer; }, []);

  function stopTimer() { if (timer.current) { clearInterval(timer.current); timer.current = null; } }

  function startPhase(p: Phase) {
    stopTimer();
    setPhase(p);
    setRemaining(PHASE_MS);
    Animated.timing(scale, { toValue: p==='inhale'?1.18:p==='exhale'?0.85:1.0, duration: PHASE_MS, useNativeDriver: true }).start();

    const start = Date.now();
    timer.current = setInterval(async () => {
      const left = Math.max(0, PHASE_MS - (Date.now() - start));
      setRemaining(left);
      if (left <= 0) {
        stopTimer();
        await playOneShot('chime', 0.3);
        if (p === 'exhale') {
          // one full 4-4-4 cycle finished
          const nextCycle = cycleInSet + 1;
          if (nextCycle > 4) {
            // celebrate set completion
            setCycleInSet(1);
            setSetCount(c => c + 1);
            setCelebrate(true);
            Animated.sequence([
              Animated.timing(confetti, { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.delay(900),
              Animated.timing(confetti, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => setCelebrate(false));
            await playOneShot('chime', 0.5);
          } else {
            setCycleInSet(nextCycle);
          }
        }
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
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop:4 }]}>4-4-4 breathing</Text>
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
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop:10 }]}>Set {setCount} • Cycle {cycleInSet}/4</Text>
      </View>

      {/* Gentle “celebration” overlay */}
      {celebrate && (
        <Animated.View style={{
          position:'absolute', left:0, right:0, top:0, bottom:0,
          alignItems:'center', justifyContent:'center',
          opacity: confetti.interpolate({ inputRange:[0,1], outputRange:[0,1] }),
          transform:[{ scale: confetti.interpolate({ inputRange:[0,1], outputRange:[0.95,1] }) }],
          pointerEvents:'none'
        }}>
          <View style={{ backgroundColor:'#00000055', padding:16, borderRadius:16 }}>
            <Text style={[textStyles.h2, { color:'#fff', textAlign:'center' }]}>✨ Nice pace!</Text>
            <Text style={[textStyles.body, { color:'#fff', textAlign:'center', marginTop:6 }]}>Set complete. You’re doing great. 🐾</Text>
          </View>
        </Animated.View>
      )}

      {/* Keep grounding */}
      <View style={{ marginTop: 28 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>5-4-3-2-1 Grounding</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>• 5 things you can see</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>• 4 things you can touch</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>• 3 things you can hear</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>• 2 things you can smell</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>• 1 thing you can taste</Text>
      </View>
    </View>
  );
}
