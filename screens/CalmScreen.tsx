import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import Svg, { Path } from 'react-native-svg';
import CatBackButton from '../components/CatBackButton';
import { saveSticker } from '../utils/storage';
import { playSong, stopAndUnload } from '../utils/audio';

const PHASE = 4000; // 4s each
type Phase = 'inhale'|'hold'|'exhale';

export default function CalmScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [sec, setSec] = useState(4);
  const [cycleInSet, setCycleInSet] = useState(1);
  const [celebrate, setCelebrate] = useState(false);
  const [earned, setEarned] = useState<string | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const stopRef = useRef(false);
  const [celebrationSong, setCelebrationSong] = useState<any>(null);

  useEffect(() => { 
    stopRef.current = false; 
    run(); 
    return () => { 
      stopRef.current = true; 
      stopAndUnload(celebrationSong);
    }; 
  }, []);

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
  async function celebrateOnce() {
    setCelebrate(true);
    const s = { id: `${Date.now()}`, name: 'Calm Set', emoji: '🐱', ts: Date.now() };
    saveSticker(s).catch(() => {});
    setEarned('🐱 Calm Set');
    
    // Play winter_bear as celebration song ❄️🐻💜
    try {
      const song = await playSong('winterbear', 0.6, false);
      setCelebrationSong(song);
    } catch (error) {
      console.log('Could not play celebration song:', error);
    }
    
    setTimeout(() => { 
      setCelebrate(false); 
      setEarned(null);
      stopAndUnload(celebrationSong);
      setCelebrationSong(null);
    }, 6000); // Extended to let the song play longer
  }

  const label = phase==='inhale'?'Inhale':phase==='hold'?'Hold':'Exhale';

  return (
    <View style={{ flex:1, backgroundColor: colors.background, padding:16 }}>
      <CatBackButton onPress={() => navigation.goBack()} />

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
        {earned && (
          <View style={{ marginTop: 8, backgroundColor: colors.surface, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>Sticker earned: {earned}</Text>
          </View>
        )}
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
