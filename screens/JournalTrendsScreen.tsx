import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Entry, loadEntries } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'JournalTrends'>;

export default function JournalTrendsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [data, setData] = useState<number[]>([]);
  useEffect(() => {
    (async () => {
      const entries = await loadEntries();
      const points = computeWeeklySparkline(entries);
      setData(points);
    })();
  }, []);
  const w = Dimensions.get('window').width - 32;
  const h = 80;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[textStyles.body, { color: colors.accent }]}>← Back</Text>
      </Pressable>
      <Text style={[textStyles.h1, { color: colors.text, marginTop: 12 }]}>Trends</Text>
      <Text style={[textStyles.body, { color: colors.mutedText, marginBottom: 12 }]}>Weekly sparkline</Text>

      <View style={{ width: w, height: h, borderRadius: 12, backgroundColor: colors.surface, overflow: 'hidden', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: '100%', width: '100%', gap: 4 }}>
          {data.map((v, i) => (
            <View key={i} style={{ width: (w - 16 - (data.length - 1) * 4) / data.length, height: 8 + v * (h - 16 - 8), backgroundColor: colors.primary }} />
          ))}
        </View>
      </View>
      <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 8 }]}>Higher bars = more positive days</Text>
    </View>
  );
}

function computeWeeklySparkline(entries: Entry[]): number[] {
  const days: number[] = new Array(7).fill(0);
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const todays = entries.filter(e => new Date(e.ts).toDateString() === dayStr);
    let score = 0;
    todays.forEach(e => {
      const m = e.mood;
      if (m === 'great') score += 3;
      else if (m === 'good') score += 2;
      else if (m === 'ok') score += 1;
    });
    days[i] = Math.min(1, score / 3);
  }
  return days;
}
