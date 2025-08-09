import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

const PHASE = 4000; // 4s each
type Phase = 'inhale'|'hold'|'exhale';

export default function CalmScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [sec, setSec] = useState(4);
  const [cycleInSet, setCycleInSet] = useState(1);
  const [celebrate, setCelebrate] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const stopRef = useRef(false);

  useEffect(() => { stopRef.current = false; run(); return () => { stopRef.current = true; }; }, []);

  async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
  async function run() {
    while (!stopRef.current) {
      await doPhase('inhale'); if (stopRef.current) break;
      await doPhase('hold');   if (stopRef.current) break;
      await doPhase('exhale'); if (stopRef.current) break;
      setCycleInSet(c => { const n = c + 1; if (n > 4) { celebrateOnce(); return 1; } return n; });
    }
  }
  async function doPhase(p: Phase) {
    setPhase(p);
    Animated.timing(scale, { toValue: p==='inhale'?1.18:p==='exhale'?0.85:1, duration: PHASE, useNativeDriver: true }).start();
    for (let t = PHASE; t >= 0 && !stopRef.current; t -= 250) { setSec(Math.max(0, Math.ceil(t/1000))); await sleep(250); }
  }
  function celebrateOnce() { setCelebrate(true); setTimeout(() => setCelebrate(false), 1100); }

  const label = phase==='inhale'?'Inhale':phase==='hold'?'Hold':'Exhale';

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
        <View style={{ width: 260, height: 260, position: 'relative', alignItems:'center', justifyContent:'center' }}>
          {/* Ears */}
          <Svg width={260} height={260} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Path d="M80 42 L110 68 L100 20 Z" fill={colors.primaryDark} />
            <Path d="M180 42 L150 68 L160 20 Z" fill={colors.primaryDark} />
          </Svg>
          {/* Belly bubble */}
          <Animated.View
            style={{
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale }]
            }}
          >
            <Text style={[textStyles.h2, { color: colors.text }]}>{label}</Text>
            <Text style={[textStyles.body, { color: colors.text, marginTop: 6 }]}>{sec}s</Text>
          </Animated.View>
        </View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop:10 }]}>Cycle {cycleInSet}/4</Text>
      </View>

      {celebrate && (
        <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0, alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <View style={{ backgroundColor:'#00000055', padding:16, borderRadius:16 }}>
            <Text style={[textStyles.h2, { color:'#fff', textAlign:'center' }]}>✨ Nice pace!</Text>
            <Text style={[textStyles.body, { color:'#fff', textAlign:'center', marginTop:6 }]}>Set complete. You’re doing great. 🐾</Text>
          </View>
        </View>
      )}
    </View>
  );
}
