import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useKeepAwake } from 'expo-keep-awake';
import { playLoop, stopAndUnload, playOneShot } from '../utils/audio';
import type { Sound } from 'expo-av';
import { soft, success } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Sleep'>;

export default function SleepScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [bedside, setBedside] = useState(false);
  const [purr, setPurr] = useState<Sound | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function run() {
      await soft();
      await new Promise(res => setTimeout(res, 20000));
      await new Promise(res => setTimeout(res, 10000));
      await playOneShot('chime', 0.3);
      await success();
    }
    run();
    return () => { stopAndUnload(purr); };
  }, []);

  useKeepAwake();

  useEffect(() => {
    (async () => {
      stopAndUnload(purr);
      if (bedside) {
        const s = await playLoop('purr', 0.2);
        setPurr(s);
      }
    })();
  }, [bedside]);

  function handlePressIn() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      playOneShot('chime', 0.4);
    }, 600);
  }

  function handlePressOut() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
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
          <Text style={[textStyles.body, { color: colors.mutedText }]}>Hold to Anchor</Text>
          <Pressable
            onLongPress={() => playOneShot('chime', 0.4)}
            delayLongPress={600}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ marginTop: 12 }}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.accent }]}>Press & Hold</Text>
          </Pressable>
          <View style={{ position: 'absolute', backgroundColor: colors.background, opacity: 0.4, top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }} />
        </View>
      ) : null}
    </View>
  );
}
