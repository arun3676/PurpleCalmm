import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, { Easing, useSharedValue, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { soft, success } from '../utils/haptics';
import { playOneShot, stopAndUnload } from '../utils/audio';
import type { Sound } from 'expo-av';

type Props = NativeStackScreenProps<RootStackParamList, 'Calm'>;

const inhale = 4000;
const hold = 7000;
const exhale = 8000;

const steps = [
  { label: 'Inhale', ms: inhale },
  { label: 'Hold', ms: hold },
  { label: 'Exhale', ms: exhale }
];

const grounding = [
  '5 things you can see',
  '4 things you can touch',
  '3 things you can hear',
  '2 things you can smell',
  '1 thing you can taste'
];

export default function CalmScreen({ navigation }: Props) {
  const { colors, reduceMotion } = useAppTheme();
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [showGrounding, setShowGrounding] = useState(false);
  const progress = useSharedValue(0);
  const [chime, setChime] = useState<Sound | null>(null);
  const size = Math.min(Dimensions.get('window').width, 320);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.85, 1.15]);
    return { transform: [{ scale }] };
  });

  useEffect(() => {
    let mounted = true;
    async function run() {
      for (let c = 0; c < 2; c++) {
        for (let p = 0; p < steps.length; p++) {
          if (!mounted) return;
          setPhase(p);
          if (p === 0) await soft();
          progress.value = withTiming(1, { duration: reduceMotion ? 200 : steps[p].ms, easing: Easing.inOut(Easing.ease) });
          await new Promise(res => setTimeout(res, steps[p].ms));
          progress.value = withTiming(0, { duration: 10 });
        }
        setCycle(prev => prev + 1);
        const s = await playOneShot('chime', 0.4);
        setChime(s);
      }
      setShowGrounding(true);
      await success();
    }
    run();
    return () => {
      mounted = false;
      stopAndUnload(chime);
    };
  }, [reduceMotion]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={[textStyles.h1, { color: colors.text }]}>Calm</Text>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>4-7-8 breathing</Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryDark,
              alignItems: 'center',
              justifyContent: 'center'
            },
            style
          ]}
        >
          <Text style={[textStyles.h2, { color: colors.text }]}>{steps[phase].label}</Text>
        </Animated.View>
        <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 12 }]}>Cycle: {cycle + 1}</Text>
      </View>

      {showGrounding ? (
        <View style={{ marginBottom: 24 }}>
          <Text style={[textStyles.h2, { color: colors.text, marginBottom: 8 }]}>5-4-3-2-1 Grounding</Text>
          {grounding.map((g, i) => (
            <Text key={i} style={[textStyles.body, { color: colors.mutedText, marginVertical: 2 }]}>• {g}</Text>
          ))}
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>You’re safe. You’re here. Breathe.</Text>
        </View>
      ) : null}
    </View>
  );
}
