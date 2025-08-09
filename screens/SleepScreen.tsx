import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useKeepAwake } from 'expo-keep-awake';
import { playLoop, stopAndUnload, playOneShot, goodNightTaeVibe } from '../utils/audio';
import type { Sound } from 'expo-av';
import { soft, success } from '../utils/haptics';
import { speak } from '../utils/voice';

type Props = NativeStackScreenProps<RootStackParamList, 'Sleep'>;

export default function SleepScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [bedside, setBedside] = useState(false);
  const [purr, setPurr] = useState<Sound | any | null>(null);
  const [anchor, setAnchor] = useState<Sound | any | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      await soft();
      // tiny wind-down cue
      await new Promise(res => setTimeout(res, 3000));
      await success();
    }
    run();
    return () => { stopAndUnload(purr); stopAndUnload(anchor); };
  }, []);

  useKeepAwake();

  useEffect(() => {
    (async () => {
      stopAndUnload(purr);
      if (bedside) {
        const s = await playLoop('purr', 0.15);
        setPurr(s);
      }
    })();
  }, [bedside]);

  async function onPressIn() {
    setHolding(true);
    // start a slightly louder purr as an "anchor tone" while held
    const a = await playLoop('purr', 0.35);
    setAnchor(a);
  }

  async function onPressOut() {
    setHolding(false);
    await stopAndUnload(anchor);
    await playOneShot('chime', 0.5);
    await speak('잘 자요', { lang: 'ko-KR', rate: 0.94, pitch: 1.15, volume: 0.95 });
    await goodNightTaeVibe();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Sleep</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Wind-down and bedside mode</Text>
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
