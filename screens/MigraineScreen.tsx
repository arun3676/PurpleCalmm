import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform, BackHandler } from 'react-native';
import * as Haptics from 'expo-haptics';
import DimOverlay from '../components/DimOverlay';
import { loadJSON, saveJSON } from '../lib/storage';
import { playOrCrossfade, stopAll, getCurrentKey } from '../lib/migraineAudio';

type SoundKey = 'brown' | 'hum' | 'rain';

const K_LAST = 'mig:last';
type LastState = { sound: SoundKey; minutes: number; dim: 0.3|0.5|0.7 };

export default function MigraineScreen({ route }: any) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [haptics, setHaptics] = useState(false);

  // hydrate prefs
  const [sound, setSound] = useState<SoundKey>('brown');
  const [isPlaying, setIsPlaying] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [dimOn, setDimOn] = useState(false);
  const [dimLevel, setDimLevel] = useState<0.3|0.5|0.7>(0.5);

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const autoStartedRef = useRef(false);

  // load settings (reduceMotion/haptics) & last prefs
  useEffect(() => {
    (async () => {
      const last = await loadJSON<LastState>(K_LAST, { sound: 'brown', minutes: 10, dim: 0.5 });
      setSound(last.sound); setMinutes(last.minutes); setDimLevel(last.dim);
      // optional global toggles (persisted elsewhere if you have a real Settings screen)
      setReduceMotion(await loadJSON('settings:reduceMotion', false));
      setHaptics(await loadJSON('settings:haptics', false));
    })();
  }, []);

  // persist lightweight prefs
  useEffect(() => { saveJSON(K_LAST, { sound, minutes, dim: dimLevel }); }, [sound, minutes, dimLevel]);

  // Back button: gently lower dim instead of popping immediately
  useEffect(() => {
    const handler = () => {
      if (dimOn) { setDimOn(false); return true; }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', handler);
    return () => BackHandler.removeEventListener('hardwareBackPress', handler);
  }, [dimOn]);

  const tap = async () => { if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{}); };

  const startTimer = useCallback((mins: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = Math.max(1, Math.min(120, Math.floor(mins))) * 60;
    setCountdown(total);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!); timerRef.current = null;
          setCountdown(null);
          stopAll(250).finally(() => setIsPlaying(false));
          if (Platform.OS === 'web') alert('Done'); else Alert.alert('Done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCountdown(null);
  }, []);

  const onPlayStop = async () => {
    await tap();
    if (isPlaying) {
      await stopAll(250); setIsPlaying(false);
    } else {
      try {
        await playOrCrossfade(sound, 250);
        setIsPlaying(true);
      } catch {
        if (Platform.OS === 'web') alert('Tap again to allow audio.'); else Alert.alert('Audio', 'Tap again to allow audio.');
      }
    }
  };

  const selectSound = async (key: SoundKey) => {
    await tap();
    setSound(key);
    if (isPlaying) { await playOrCrossfade(key, 250); }
  };

  // auto-start if navigated with params
  useEffect(() => {
    const mins = Number(route?.params?.minutes ?? 0);
    const autoStart = route?.params?.autoStart === true || route?.params?.autoStart === 'true';
    if (autoStart && mins > 0 && !autoStartedRef.current) {
      autoStartedRef.current = true;
      setMinutes(mins);
      setDimOn(true);
      setTimeout(() => { onPlayStop(); startTimer(mins); }, 200);
    }
  }, [route?.params]);

  useEffect(() => () => { // cleanup
    if (timerRef.current) clearInterval(timerRef.current);
    stopAll(150);
  }, []);

  const mLabel = useMemo(() => {
    if (countdown === null) return `${minutes} min`;
    const m = Math.floor(countdown/60).toString().padStart(2,'0');
    const s = (countdown%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }, [minutes, countdown]);

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Migraine</Text>
      <Text style={s.sub}>Ultra-dim with gentle sound</Text>

      {/* Sound */}
      <Text style={s.section}>Sound</Text>
      <Text style={s.mini}>Tap to start/stop. Switch sounds crossfades.</Text>

      <View style={s.row}>
        {(['brown','hum','rain'] as SoundKey[]).map((k) => (
          <Pressable key={k} onPress={() => selectSound(k)} accessibilityLabel={`${k} sound`} style={[s.chip, sound===k && s.chipOn]}>
            <Text style={[s.chipText, sound===k && s.chipTextOn]}>
              {k==='brown'?'Brown noise':k==='hum'?'Soft hum':'Rain'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onPlayStop} style={[s.bigBtn, isPlaying && s.bigBtnOn]} accessibilityLabel={isPlaying?'Stop sound':'Play sound'}>
        <Text style={s.bigBtnText}>{isPlaying?'Stop':'Play'}</Text>
      </Pressable>

      {/* Timer */}
      <Text style={s.section}>Timer</Text>
      <View style={s.row}>
        {[1,5,10].map((m)=>(
          <Pressable key={m} onPress={()=>setMinutes(m)} style={[s.chip, minutes===m && s.chipOn]}>
            <Text style={[s.chipText, minutes===m && s.chipTextOn]}>{m}m</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.row}>
        <Pressable onPress={()=>setMinutes(v=>Math.max(1, v-1))} style={s.smallBtn}><Text style={s.smallBtnText}>âˆ’1</Text></Pressable>
        <Text style={s.current}>{mLabel}</Text>
        <Pressable onPress={()=>setMinutes(v=>Math.min(120, v+1))} style={s.smallBtn}><Text style={s.smallBtnText}>+1</Text></Pressable>
      </View>

      <View style={s.row}>
        {countdown===null ? (
          <Pressable onPress={()=>{ startTimer(minutes); }} style={[s.bigBtn, s.primary]} accessibilityLabel="Start timer">
            <Text style={s.bigBtnText}>Start</Text>
          </Pressable>
        ) : (
          <Pressable onPress={()=>{ stopTimer(); stopAll(150); setIsPlaying(false); }} style={[s.bigBtn, s.danger]} accessibilityLabel="Stop timer">
            <Text style={s.bigBtnText}>Stop</Text>
          </Pressable>
        )}
      </View>

      {/* Ultra-dim */}
      <Text style={s.section}>Ultra-dim</Text>
      <View style={s.row}>
        <Pressable onPress={()=>setDimOn(v=>!v)} style={[s.bigBtn, dimOn && s.bigBtnOn]} accessibilityLabel={dimOn?'Turn dim off':'Turn dim on'}>
          <Text style={s.bigBtnText}>{dimOn?'Dim ON':'Dim OFF'}</Text>
        </Pressable>
      </View>
      <View style={s.row}>
        {[0.3,0.5,0.7].map((v)=>(
          <Pressable key={v} onPress={()=>setDimLevel(v as 0.3|0.5|0.7)} style={[s.chip, dimLevel===v && s.chipOn]}>
            <Text style={[s.chipText, dimLevel===v && s.chipTextOn]}>{Math.round((v as number)*100)}%</Text>
          </Pressable>
        ))}
      </View>

      {/* Quick tips â€“ low stimulation */}
      <Text style={s.section}>Quick Tips</Text>
      <View style={s.card}>
        <Text style={s.tip}>â€¢ Lower light and sound.</Text>
        <Text style={s.tip}>â€¢ Small sips of water.</Text>
        <Text style={s.tip}>â€¢ Rest your eyes a moment.</Text>
      </View>

      <DimOverlay visible={dimOn} level={dimLevel} onLevelChange={(lvl)=>setDimLevel(lvl)} onExit={()=>setDimOn(false)} reduceMotion={reduceMotion} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{ flex:1, padding:18, backgroundColor:'#EFE9FB' },
  title:{ fontSize:34, fontWeight:'800', color:'#1f1b2e', marginTop:8 },
  sub:{ fontSize:16, color:'#4b445e', marginBottom:16 },
  section:{ fontSize:18, fontWeight:'700', color:'#332b49', marginTop:12, marginBottom:6 },
  mini:{ fontSize:14, color:'#6b6580', marginBottom:8 },
  row:{ flexDirection:'row', flexWrap:'wrap', gap:10, alignItems:'center', marginBottom:10 },
  chip:{ paddingVertical:10, paddingHorizontal:16, borderRadius:999, backgroundColor:'#e6dcff' },
  chipOn:{ backgroundColor:'#8b5cf6' },
  chipText:{ color:'#4b4b4b', fontSize:15, fontWeight:'600' },
  chipTextOn:{ color:'white' },
  bigBtn:{ backgroundColor:'#d7c8ff', paddingVertical:14, paddingHorizontal:22, borderRadius:14, alignItems:'center', minWidth:140 },
  bigBtnOn:{ backgroundColor:'#8b5cf6' },
  bigBtnText:{ color:'white', fontWeight:'800', fontSize:18 },
  primary:{ backgroundColor:'#6d28d9' },
  danger:{ backgroundColor:'#ef4444' },
  smallBtn:{ backgroundColor:'#d7c8ff', paddingVertical:10, paddingHorizontal:16, borderRadius:10 },
  smallBtnText:{ color:'white', fontWeight:'800', fontSize:18 },
  current:{ fontSize:20, fontWeight:'800', color:'#332b49', minWidth:96, textAlign:'center' },
  card:{ backgroundColor:'#fff7ff', borderRadius:14, padding:14 },
  tip:{ color:'#4b445e', fontSize:16, marginBottom:6 },
});
// Removed duplicate legacy imports block
  const { migraineDefaultMinutes, setMigraineDefaultMinutes, masterVolume } = useSettings();
  const [meow, setMeow] = useState<any | null>(null);
  const [mins, setMins] = React.useState<number>(migraineDefaultMinutes || 10);
  const [resetRunning, setResetRunning] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  // Added state & helpers
  const [dim, setDim] = React.useState<number>(0);
  const [running, setRunning] = React.useState(false);
  const [leftMs, setLeftMs] = React.useState(0);
  const tickRef = useRef<any>(null);

  const [toast, setToast] = React.useState<string | null>(null);
  const toastA = useRef(new Animated.Value(0)).current;
  function showToast(msg: string) {
    setToast(msg);
    toastA.setValue(0);
    Animated.timing(toastA, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
      setTimeout(() => Animated.timing(toastA, { toValue: 0, duration: 180, useNativeDriver: true })
        .start(() => setToast(null)), 1400);
    });
  }

  // auto-start support
  React.useEffect(() => {
    const auto = route?.params?.autoStart;
    const m = route?.params?.minutes;
    if (auto) {
      const v = Math.max(1, Math.min(120, Number(m) || mins));
      setMins(v);
      startSession(v);
    }
  }, [route?.params?.autoStart]);

  function clamp(n:number,min=0,max=0.85){ return Math.max(min, Math.min(max, n)); }
  function fmt(ms:number){ const s=Math.max(0, Math.ceil(ms/1000)); const m=Math.floor(s/60); const r=s%60; return `${m}:${String(r).padStart(2,'0')}`; }

  function startSession(minutes: number) {
    const total = Math.max(1, Math.floor(minutes)) * 60 * 1000;
    if (tickRef.current) clearInterval(tickRef.current);
    setLeftMs(total);
    setRunning(true);
    if (dim === 0) setDim(0.6);
    const t0 = Date.now();
    tickRef.current = setInterval(() => {
      const left = total - (Date.now() - t0);
      if (left <= 0) { stopSession(true); } else { setLeftMs(left); }
    }, 500);
  }

  async function stopSession(auto=false) {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
    setLeftMs(0);
    setDim(0);
    try { await stopAndUnload(meow); } catch {}
    setMeow(null);
    if (auto) showToast('Session complete');
  }

  React.useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  useEffect(() => { setMins(migraineDefaultMinutes || 10); }, [migraineDefaultMinutes]);

  useEffect(() => {
    (async () => { try { if (Platform.OS !== 'web') await Brightness.setSystemBrightnessAsync(0.02); } catch {} })();
    return () => { stopAndUnload(meow); };
  }, [meow]);

  const stepText = [
    'Dim lights. Unclench jaw. Shoulders down.',
    'Inhale 4 â€¢ Exhale 6 â€” slow and soft.',
    'Cool pack on neck / warm hands if available.',
    'Close eyes: name 3 sounds, 2 touches, 1 smell.'
  ];

  // Quick tips list
  const QUICK_TIPS: string[] = [
    'Dim screen and reduce noise.',
    'Small, steady sips of water help prevent dehydration â€” a common migraine trigger.',
    'Cool pack on neck or warm hands.',
    '4 in / 6 out breathing for 1 min.',
    'Sudden new or severe symptoms â†’ seek medical care.',
  ];

  const [exerciseOpen, setExerciseOpen] = React.useState<{title:string, steps:{label:string, seconds:number}[]} | null>(null);
  const EX_60_RESET = { title: '60-second Reset', steps: [ { label: '4-4-4 Breathing', seconds: 20 }, { label: 'Temple Massage â€“ Left', seconds: 20 }, { label: 'Temple Massage â€“ Right', seconds: 20 } ] };
  const EX_EYE_SOOTHE = { title: 'Eye Soothe', steps: [ { label: 'Look Far (relax focus)', seconds: 20 }, { label: 'Blink & Soften Eyes', seconds: 10 }, { label: 'Palming (cover eyes)', seconds: 20 } ] };
  const EX_NECK_RELEASE = { title: 'Neck Release', steps: [ { label: 'Left ear â†’ left shoulder', seconds: 20 }, { label: 'Right ear â†’ right shoulder', seconds: 20 }, { label: 'Chin tuck (gentle)', seconds: 20 } ] };

  async function quickNote() {
    await saveEntry({ id: `${Date.now()}`, type: 'migraineNote', note: 'Quick note during migraine', ts: Date.now() });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex:1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[textStyles.body, { color: colors.accent }]}>â† Back</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={[textStyles.h1, { color: colors.text }]}>Migraine</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Ultra-dim with gentle sound</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Sound</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Tap to start/stop.</Text>
          <View style={{ flexDirection:'row', gap:12, marginTop:8 }}>
            <PawButton
              label={meow ? 'â¸ Mochi Meow' : 'â–¶ï¸Ž Mochi Meow'}
              onPress={async () => {
                try {
                  await ensureUnlocked();
                  if (meow) {
                    await stopAndUnload(meow); setMeow(null); stopSfx('sad_meow' as any);
                  } else {
                    await stopAllSongs();
                    await playOnce('sad_meow' as any, masterVolume ?? 0.6);
                    // leave setMeow for legacy now playing bar; not strictly needed for sfx
                  }
                } catch {}
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Timer</Text>

          <View style={{ flexDirection:'row', gap:10, marginTop:8, flexWrap:'wrap' as const }}>
            {[1,5,10,15,30,45].map(v => (
              <Pressable key={v} onPress={() => { setMins(v); setMigraineDefaultMinutes(v); showToast(`Default: ${v} min`); }}
                style={{ backgroundColor: v===mins? colors.primary: colors.surface, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>{v}m</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginTop:12 }}>
            <Pressable onPress={() => setMins(m => Math.max(1, m-1))} onLongPress={() => setMins(m => Math.max(1, m-5))}
              style={{ backgroundColor: colors.surface, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>âˆ’1</Text>
            </Pressable>

            <Text style={[textStyles.h2, { color: colors.text }]}>{mins} min</Text>

            <Pressable onPress={() => setMins(m => Math.min(120, m+1))} onLongPress={() => setMins(m => Math.min(120, m+5))}
              style={{ backgroundColor: colors.surface, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>+1</Text>
            </Pressable>

            {!running ? (
              <Pressable
                onPress={async () => { await resumeAll(); startSession(mins); }}
                style={{ marginLeft:'auto', backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:16, borderRadius:12 }}
              >
                <Text style={[textStyles.body, { color: colors.text }]}>Start</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => stopSession(false)}
                style={{ marginLeft:'auto', backgroundColor: colors.surface, paddingVertical:10, paddingHorizontal:16, borderRadius:12 }}
              >
                <Text style={[textStyles.body, { color: colors.text }]}>Stop</Text>
              </Pressable>
            )}
          </View>

          {running && (
            <Text style={[textStyles.body, { color: colors.mutedText, marginTop:6 }]}>Time left: {fmt(leftMs)}</Text>
          )}

          <View style={{ marginTop: 8 }}>
            <Text style={[{ fontSize: 12, lineHeight: 16 }, { color: colors.mutedText }]}>Tip: Small, steady sips of water help prevent dehydration â€” a common migraine trigger.</Text>
          </View>
        </View>

        <View style={{ marginTop: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 14 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
          <View style={{ marginTop: 8 }}>
            {QUICK_TIPS.map((t) => (
              <Text key={t} style={[textStyles.body, { color: colors.mutedText, marginBottom: 6 }]}>
                â€¢ {t}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Exercises</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Tap to run a short guided set.</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap' as const, gap:10, marginTop:8 }}>
            <PawButton label="60-sec Reset" onPress={async () => { await resumeAll(); startSession(mins); setExerciseOpen(EX_60_RESET); }} />
            <PawButton label="Eye Soothe" onPress={async () => { await resumeAll(); startSession(mins); setExerciseOpen(EX_EYE_SOOTHE); }} />
            <PawButton label="Neck Release" onPress={async () => { await resumeAll(); startSession(mins); setExerciseOpen(EX_NECK_RELEASE); }} />
          </View>
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <PawButton label="Start Timer" onPress={async () => { await resumeAll(); startSession(mins); }} />
          <PawButton label="Quick Note" onPress={quickNote} />
        </View>

      </ScrollView>

      {dim > 0 && (
        <View pointerEvents="none" style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'#000', opacity: dim }}/>
      )}

      <NowPlayingBar visible={!!meow} />
      {exerciseOpen && (
        <ExerciseRunner
          visible={!!exerciseOpen}
          title={exerciseOpen.title}
          steps={exerciseOpen.steps}
          colors={colors}
          textStyles={textStyles}
          onClose={() => setExerciseOpen(null)}
        />
      )}

      {toast && (
        <Animated.View style={{ position:'absolute', left:16, right:16, bottom:16, backgroundColor:'rgba(0,0,0,0.78)', paddingVertical:8, paddingHorizontal:12, borderRadius:12, alignItems:'center', opacity: toastA, transform:[{ translateY: toastA.interpolate({inputRange:[0,1],outputRange:[10,0]}) }] }}>
          <Text style={{ color:'#fff' }}>{toast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

