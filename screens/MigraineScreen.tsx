import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, Platform, ScrollView, Animated } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import * as Brightness from 'expo-brightness';
import { playSong, stopAndUnload, stopAllSongs, resumeAll } from '../utils/audio';
import { scheduleIn } from '../utils/notifications';
import PawButton from '../components/PawButton';
import { saveEntry } from '../utils/storage';
import NowPlayingBar from '../components/NowPlayingBar';
import { useSettings } from '../providers/SettingsProvider';
import ExerciseRunner from '../components/ExerciseRunner';
import { useRef } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Migraine'>;

export default function MigraineScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { settings, setMigraineMinutes } = useSettings();
  const [meow, setMeow] = useState<any | null>(null);
  const [mins, setMins] = React.useState<number>(settings.migraineMinutes);
  const [hydration, setHydration] = useState(false);
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

  useEffect(() => { setMins(settings.migraineMinutes); }, [settings.migraineMinutes]);

  useEffect(() => {
    (async () => { try { if (Platform.OS !== 'web') await Brightness.setSystemBrightnessAsync(0.02); } catch {} })();
    return () => { stopAndUnload(meow); };
  }, [meow]);

  const stepText = [
    'Dim lights. Unclench jaw. Shoulders down.',
    'Inhale 4 • Exhale 6 — slow and soft.',
    'Cool pack on neck / warm hands if available.',
    'Close eyes: name 3 sounds, 2 touches, 1 smell.'
  ];

  // Quick tips list
  const QUICK_TIPS = [
    'Dim screen and reduce noise.',
    'Small sips of water (enable reminder below).',
    'Cool pack on neck or warm hands.',
    '4 in / 6 out breathing for 1 min.',
    'Sudden new or severe symptoms → seek medical care.',
  ];

  const [exerciseOpen, setExerciseOpen] = React.useState<{title:string, steps:{label:string, seconds:number}[]} | null>(null);
  const EX_60_RESET = { title: '60-second Reset', steps: [ { label: '4-4-4 Breathing', seconds: 20 }, { label: 'Temple Massage – Left', seconds: 20 }, { label: 'Temple Massage – Right', seconds: 20 } ] };
  const EX_EYE_SOOTHE = { title: 'Eye Soothe', steps: [ { label: 'Look Far (relax focus)', seconds: 20 }, { label: 'Blink & Soften Eyes', seconds: 10 }, { label: 'Palming (cover eyes)', seconds: 20 } ] };
  const EX_NECK_RELEASE = { title: 'Neck Release', steps: [ { label: 'Left ear → left shoulder', seconds: 20 }, { label: 'Right ear → right shoulder', seconds: 20 }, { label: 'Chin tuck (gentle)', seconds: 20 } ] };

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
          <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
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
              label={meow ? '⏸ Mochi Meow' : '▶︎ Mochi Meow'}
              onPress={async () => {
                await resumeAll();
                if (meow) {
                  await stopAndUnload(meow);
                  setMeow(null);
                } else {
                  await stopAllSongs();
                  const s = await playSong('sadmeow', 0.7, true);
                  setMeow(s);
                }
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Timer</Text>

          <View style={{ flexDirection:'row', gap:10, marginTop:8, flexWrap:'wrap' as const }}>
            {[1,5,10,15,30,45].map(v => (
              <Pressable key={v} onPress={() => { setMins(v); setMigraineMinutes(v); showToast(`Default: ${v} min`); }}
                style={{ backgroundColor: v===mins? colors.primary: colors.surface, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>{v}m</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginTop:12 }}>
            <Pressable onPress={() => setMins(m => Math.max(1, m-1))} onLongPress={() => setMins(m => Math.max(1, m-5))}
              style={{ backgroundColor: colors.surface, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>−1</Text>
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
        </View>

        <View style={{ marginTop: 18, backgroundColor: colors.surface, padding: 14, borderRadius: 16 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
          {QUICK_TIPS.map((line, i) => (
            <Text key={i} style={[textStyles.body, { color: colors.mutedText, marginTop: i ? 6 : 8 }]}>
              • {line}
            </Text>
          ))}
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

        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Switch value={hydration} onValueChange={setHydration} />
          <Text style={[textStyles.body, { color: colors.mutedText, marginLeft: 8 }]}>Hydration reminder</Text>
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
