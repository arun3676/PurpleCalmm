
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, ScrollView, Animated } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import * as Brightness from 'expo-brightness';
import { playSong, stopAndUnload, stopAllSongs, resumeAll } from '../utils/audio';
import { ensureUnlocked, playOnce, stop as stopSfx } from '../utils/sfx';
import DimOverlay from '../components/DimOverlay';
import { playOrCrossfade, stopAll } from '../lib/migraineAudio';
import PawButton from '../components/PawButton';
import { saveEntry } from '../utils/storage';
import NowPlayingBar from '../components/NowPlayingBar';
import { useSettings } from '../providers/SettingsProvider';
import ExerciseRunner from '../components/ExerciseRunner';
import { useRef } from 'react';
import { useRoute } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Migraine'>;

export default function MigraineScreen({ navigation }: Props) {
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const { migraineDefaultMinutes, setMigraineDefaultMinutes, masterVolume } = useSettings();
  const [meow, setMeow] = useState<any | null>(null);
  const [sound, setSound] = useState<'brown'|'hum'|'rain'|'sadmeow'>('brown');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mins, setMins] = React.useState<number>(migraineDefaultMinutes || 10);
  const [resetRunning, setResetRunning] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  // Added state & helpers
  const [dim, setDim] = React.useState<number>(0);
  const [dimOn, setDimOn] = React.useState(false);
  const [dimLevel, setDimLevel] = React.useState<0.3|0.5|0.7>(0.5);
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
    setDimOn(true);
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
    setDimOn(false);
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
    'Inhale 4 • Exhale 6 — slow and soft.',
    'Cool pack on neck / warm hands if available.',
    'Close eyes: name 3 sounds, 2 touches, 1 smell.'
  ];

  // Quick tips list
  const QUICK_TIPS: string[] = [
    'Dim screen and reduce noise immediately.',
    'Small, steady sips of water help prevent dehydration — a common migraine trigger.',
    'Cool pack on neck or warm hands for comfort.',
    '4 in / 6 out breathing for 1 minute.',
    'Try the 60-second reset exercise for quick relief.',
    'Sudden new or severe symptoms → seek medical care.',
  ];

  const [exerciseOpen, setExerciseOpen] = React.useState<{title:string, steps:{label:string, seconds:number}[]} | null>(null);
  
  // Exercise definitions with detailed steps
  const EX_60_RESET = { 
    title: '60-second Reset', 
    steps: [ 
      { label: '4-4-4 Breathing: Inhale 4, hold 4, exhale 4', seconds: 20 }, 
      { label: 'Temple Massage – Left side gently', seconds: 20 }, 
      { label: 'Temple Massage – Right side gently', seconds: 20 } 
    ] 
  };
  
  const EX_EYE_SOOTHE = { 
    title: 'Eye Soothe', 
    steps: [ 
      { label: 'Look far away to relax eye focus', seconds: 20 }, 
      { label: 'Blink slowly & soften your gaze', seconds: 10 }, 
      { label: 'Palming: cover eyes with warm hands', seconds: 20 } 
    ] 
  };
  
  const EX_NECK_RELEASE = { 
    title: 'Neck Release', 
    steps: [ 
      { label: 'Gently tilt left ear toward left shoulder', seconds: 20 }, 
      { label: 'Gently tilt right ear toward right shoulder', seconds: 20 }, 
      { label: 'Chin tuck: gently tuck chin to chest', seconds: 20 } 
    ] 
  };

  async function quickNote() {
    const note = `Migraine episode - ${new Date().toLocaleString()}`;
    await saveEntry({ id: `${Date.now()}`, type: 'migraineNote', note, ts: Date.now() });
    showToast('Quick note saved');
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
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Tap to start/stop. Switch sounds crossfades.</Text>
          <View style={{ flexDirection:'row', gap:12, marginTop:8, flexWrap:'wrap' as const }}>
            {(['brown','hum','rain','sadmeow'] as const).map(k => (
              <Pressable key={k} onPress={async () => { 
                console.log(`Selecting sound: ${k}`);
                setSound(k); 
                if (isPlaying) {
                  try {
                    await playOrCrossfade(k, 250);
                  } catch (error) {
                    console.error('Error switching audio:', error);
                  }
                }
              }}
                style={{ backgroundColor: sound===k? colors.primary : colors.surface, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>
                  {k==='brown'?'Brown noise':k==='hum'?'Soft hum':k==='rain'?'Rain':k==='sadmeow'?'Mochi Meow':'Unknown'}
                </Text>
              </Pressable>
            ))}
            <Pressable onPress={async () => {
              console.log('Play button clicked, isPlaying:', isPlaying, 'sound:', sound);
              try {
                await ensureUnlocked();
                if (isPlaying) { 
                  console.log('Stopping audio...');
                  await stopAll(250); 
                  setIsPlaying(false); 
                } else { 
                  console.log('Starting audio...', sound);
                  await playOrCrossfade(sound, 250); 
                  setIsPlaying(true); 
                }
              } catch (error) {
                console.error('Audio playback error:', error);
              }
            }}
              style={{ backgroundColor: isPlaying? colors.primaryDark : colors.surface, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>{isPlaying ? 'Stop' : 'Play'}</Text>
            </Pressable>
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

          <View style={{ marginTop: 8 }}>
            <Text style={[{ fontSize: 12, lineHeight: 16 }, { color: colors.mutedText }]}>Tip: Small, steady sips of water help prevent dehydration — a common migraine trigger.</Text>
          </View>
        </View>

        <View style={{ marginTop: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 14 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
          <View style={{ marginTop: 8 }}>
            {QUICK_TIPS.map((t) => (
              <Text key={t} style={[textStyles.body, { color: colors.mutedText, marginBottom: 6 }]}>
                • {t}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>Migraine Exercises</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Guided exercises to help relieve migraine symptoms</Text>
          
          <View style={{ marginTop: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: 8 }]}>Breathing & Reset</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap' as const, gap:10, marginBottom: 16 }}>
              <PawButton label="60-sec Reset" onPress={async () => { await resumeAll(); setExerciseOpen(EX_60_RESET); }} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: 8 }]}>Eye Relief</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap' as const, gap:10, marginBottom: 16 }}>
              <PawButton label="Eye Soothe" onPress={async () => { await resumeAll(); setExerciseOpen(EX_EYE_SOOTHE); }} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: 8 }]}>Tension Release</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap' as const, gap:10, marginBottom: 16 }}>
              <PawButton label="Neck Release" onPress={async () => { await resumeAll(); setExerciseOpen(EX_NECK_RELEASE); }} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: 8 }]}>Tools</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap' as const, gap:10, marginBottom: 24 }}>
              <PawButton label="Start Timer" onPress={async () => { await resumeAll(); startSession(mins); }} />
              <PawButton label="Quick Note" onPress={quickNote} />
            </View>
          </View>
        </View>

      </ScrollView>

      <DimOverlay
        visible={dimOn}
        level={dimLevel}
        onLevelChange={lvl => setDimLevel(lvl)}
        onExit={() => setDimOn(false)}
        reduceMotion={false}
      />

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
