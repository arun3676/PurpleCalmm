import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import * as Brightness from 'expo-brightness';
import { playLoop, stopAndUnload } from '../utils/audio';
import type { Sound } from 'expo-av';
import { scheduleIn } from '../utils/notifications';
import PawButton from '../components/PawButton';
import { saveEntry } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Migraine'>;

export default function MigraineScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [sounds, setSounds] = useState<{ purr?: Sound | null; rain?: Sound | null; waterfall?: Sound | null }>({});
  const [timer, setTimer] = useState<15 | 30 | 45>(15);
  const [hydration, setHydration] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          await Brightness.setSystemBrightnessAsync(0.02);
        }
      } catch {}
    })();
    return () => {
      Object.values(sounds).forEach(stopAndUnload);
    };
  }, []);

  async function toggle(name: 'purr' | 'rain' | 'waterfall') {
    const current = sounds[name];
    if (current) {
      await stopAndUnload(current);
      setSounds(prev => ({ ...prev, [name]: null }));
    } else {
      const s = await playLoop(name, 0.25);
      setSounds(prev => ({ ...prev, [name]: s }));
    }
  }

  async function startTimer() {
    if (hydration) {
      await scheduleIn(timer, 'Hydration reminder', 'Sip water to support recovery');
    }
  }

  async function quickNote() {
    await saveEntry({ id: `${Date.now()}`, type: 'migraineNote', note: 'Quick note during migraine', ts: Date.now() });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Migraine</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Ultra-dim with soothing sounds</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Sounds</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 4 }]}>Tap a button to start/stop. On web, first tap unlocks audio.</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' as const }}>
          <PawButton label="Purr" onPress={() => toggle('purr')} />
          <PawButton label="Rain" onPress={() => toggle('rain')} />
          <PawButton label="Waterfall" onPress={() => toggle('waterfall')} />
        </View>
      </View>

      <View style={{ marginTop: 24, backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Quick Tips</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}> 
          • Dim the screen (done) and lower volume.{"\n"}
          • Sip water every ~10 min (enable reminder).{"\n"}
          • Try cool compress on neck or warm on hands.{"\n"}
          • Breathe 4 in / 6 out for 1 minute.{"\n"}
          • If new or severe symptoms appear suddenly, seek medical care.
        </Text>
      </View>

      <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Timer: </Text>
        {[15, 30, 45].map(v => (
          <Pressable key={v} onPress={() => setTimer(v as 15 | 30 | 45)} style={{ marginHorizontal: 8 }}>
            <Text style={[textStyles.bodyMedium, { color: v === timer ? colors.accent : colors.mutedText }]}>{v}m</Text>
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
