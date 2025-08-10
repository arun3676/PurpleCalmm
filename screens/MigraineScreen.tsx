import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Migraine'>;

export default function MigraineScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { settings, setMigraineMinutes } = useSettings();
  const [meow, setMeow] = useState<any | null>(null);
  const [mins, setMins] = React.useState<number>(settings.migraineMinutes);
  const [hydration, setHydration] = useState(false);
  const [resetRunning, setResetRunning] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  useEffect(() => { setMins(settings.migraineMinutes); }, [settings.migraineMinutes]);

  useEffect(() => {
    (async () => { try { if (Platform.OS !== 'web') await Brightness.setSystemBrightnessAsync(0.02); } catch {} })();
    return () => { stopAndUnload(meow); };
  }, [meow]);

  function clamp(n:number){ return Math.max(1, Math.min(120, Math.floor(n))); }
  function commit(n:number){ const v = clamp(n); setMins(v); setMigraineMinutes(v); try { alert('Saved: ' + v + ' min'); } catch {} }

  async function startTimer() {
    if (hydration) await scheduleIn(mins, 'Hydration reminder', 'Sip water to support recovery');
  }

  async function quickNote() {
    await saveEntry({ id: `${Date.now()}`, type: 'migraineNote', note: 'Quick note during migraine', ts: Date.now() });
  }

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

      <View style={{ marginTop: 16 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Timer</Text>
        <View style={{ flexDirection:'row', gap:10, marginTop:8, flexWrap:'wrap' as const }}>
          {[1,5,10,15,30,45].map(v => (
            <Pressable key={v} onPress={() => commit(v)} style={{ backgroundColor: v===mins? colors.primary: colors.surface, paddingVertical:8, paddingHorizontal:12, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>{v}m</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginTop:12 }}>
          <Pressable onPress={() => setMins(m => clamp(m-1))} onLongPress={() => setMins(m => clamp(m-5))}
            style={{ backgroundColor: colors.surface, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>−1</Text>
          </Pressable>
          <Text style={[textStyles.h2, { color: colors.text }]}>{mins} min</Text>
          <Pressable onPress={() => setMins(m => clamp(m+1))} onLongPress={() => setMins(m => clamp(m+5))}
            style={{ backgroundColor: colors.surface, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>+1</Text>
          </Pressable>
          <Pressable onPress={() => commit(mins)} style={{ marginLeft: 'auto', backgroundColor: colors.primary, paddingVertical:8, paddingHorizontal:14, borderRadius:12 }}>
            <Text style={[textStyles.body, { color: colors.text }]}>Save</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}> 
          • Dim screen and reduce noise{"\n"}
          • Small sips of water (enable reminder below){"\n"}
          • Cool pack on neck or warm hands{"\n"}
          • 4 in / 6 out breathing for 1 min{"\n"}
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

      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Switch value={hydration} onValueChange={setHydration} />
        <Text style={[textStyles.body, { color: colors.mutedText, marginLeft: 8 }]}>Hydration reminder</Text>
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
        <PawButton label="Start Timer" onPress={startTimer} />
        <PawButton label="Quick Note" onPress={quickNote} />
      </View>

      <NowPlayingBar visible={!!meow} />
    </View>
  );
}
