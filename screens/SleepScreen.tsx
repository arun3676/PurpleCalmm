import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
// import { useKeepAwake } from 'expo-keep-awake'; // Removed for web compatibility
import { playLoop, stopAndUnload, playSong, resumeAll, stopAllSongs } from '../utils/audio';
import { unlockAudio, playGoodnight } from '../utils/sfx';
import { useSettings } from '../providers/SettingsProvider';
import type { Sound } from 'expo-av';
import { soft, success } from '../utils/haptics';
import CatBackButton from '../components/CatBackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Sleep'>;

export default function SleepScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { masterVolume, voice } = useSettings();
  const [bedside, setBedside] = useState(false);
  const [purr, setPurr] = useState<Sound | any | null>(null);
  const [anchor, setAnchor] = useState<any | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    async function run() {
      await soft();
      await new Promise(res => setTimeout(res, 3000));
      await success();
    }
    run();
    return () => { stopAndUnload(purr); stopAndUnload(anchor); };
  }, []);

  // useKeepAwake(); // Removed for web compatibility

  useEffect(() => {
    (async () => {
      stopAndUnload(purr);
      if (bedside) {
        const s = await playLoop?.('softpurr', 0.15);
        setPurr(s);
      }
    })();
  }, [bedside]);

  async function onPressIn() {
    setHolding(true);
    await unlockAudio();
    try {
      await resumeAll();
      const a = await playLoop?.('softpurr', 0.35);
      setAnchor(a);
    } catch {}
  }

  async function onPressOut() {
    setHolding(false);
    await stopAndUnload(anchor);
    await stopAllSongs();
    try {
      await playGoodnight(voice as any, masterVolume ?? 0.8);
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <CatBackButton onPress={() => navigation.goBack()} />

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Sleep</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Wind-down and bedside mode</Text>
          {holding && <Text style={{ opacity: 0.7, marginTop: 8 }}>…purring…</Text>}
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Bedside Mode</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Switch value={bedside} onValueChange={setBedside} />
          <Text style={[textStyles.body, { color: colors.mutedText, marginLeft: 8 }]}>Tiny purring cat, dim screen</Text>
        </View>
      </View>

      {bedside ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>🐱</Text>
          <Text style={[textStyles.body, { color: colors.mutedText }]}>{holding ? 'Anchoring…' : 'Hold to Anchor'}</Text>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.primaryDark }}
            hitSlop={20}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{holding ? 'Release' : 'Press & Hold'}</Text>
          </Pressable>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}>You’ll hear “good night” when you release</Text>

          {/* Dim overlay must not block touches */}
          <View style={{ position: 'absolute', backgroundColor: colors.background, opacity: 0.4, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }} />
        </View>
      ) : null}
    </View>
  );
}
