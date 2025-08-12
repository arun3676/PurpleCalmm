import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

const minutesClamp = (n: number) => Math.max(1, Math.min(120, Math.round(n || 1)));

export default function MigraineScreen() {
  const { colors } = useAppTheme();

  const [dimOn, setDimOn] = useState(false);
  const [dimLevel, setDimLevel] = useState(0.6);
  const [minutes, setMinutes] = useState<number>(10);
  const [running, setRunning] = useState(false);
  const [msLeft, setMsLeft] = useState(0);
  const [soundName, setSoundName] = useState<'brown' | 'hum' | 'rain' | 'mochi'>('mochi');
  const endAtRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    if (!endAtRef.current) endAtRef.current = Date.now() + minutes * 60_000;
    const tick = () => {
      const left = Math.max(0, endAtRef.current! - Date.now());
      setMsLeft(left);
      if (left <= 0) stopTimer();
    };
    tick();
    tickRef.current = setInterval(tick, 250);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running]);

  function startTimer() {
    endAtRef.current = Date.now() + minutes * 60_000;
    setRunning(true);
  }
  function stopTimer() {
    setRunning(false);
    endAtRef.current = null;
    setMsLeft(0);
  }

  const mm = Math.floor(msLeft / 60000);
  const ss = Math.floor((msLeft % 60000) / 1000);
  const leftText = running ? `${mm}:${String(ss).padStart(2, '0')}` : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>Sound</Text>
        <Text style={[styles.sub, { color: colors.subtle }]}>Tap to start/stop.</Text>

        <View style={styles.row}>
          <Pressable onPress={() => setSoundName('mochi')} style={[styles.pill, { backgroundColor: colors.accentBg }]}>
            <Text style={[styles.pillText, { color: colors.accentText }]}>🐾 Mochi Meow</Text>
          </Pressable>
        </View>

        <Text style={[textStyles.h2, { color: colors.text, marginTop: 24 }]}>Timer</Text>
        <View style={styles.rowWrap}>
          {([1, 5, 10, 15, 30, 45] as const).map((m) => (
            <Pressable key={m} onPress={() => setMinutes(m)} style={[styles.chip, { backgroundColor: minutes === m ? colors.accentBg : colors.card }]}>
              <Text style={{ color: minutes === m ? colors.accentText : colors.text }}>{m}m</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <Pressable onPress={() => setMinutes(minutesClamp(minutes - 1))} style={[styles.step, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text }}>−1</Text>
          </Pressable>
          <Text style={[styles.midText, { color: colors.text }]}>{minutes} min</Text>
          <Pressable onPress={() => setMinutes(minutesClamp(minutes + 1))} style={[styles.step, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text }}>+1</Text>
          </Pressable>
          <Pressable onPress={running ? stopTimer : startTimer} style={[styles.start, { backgroundColor: colors.accentBg, marginLeft: 'auto' }]}>
            <Text style={{ color: colors.accentText }}>{running ? 'Stop' : 'Start'}</Text>
          </Pressable>
        </View>

        {running ? (
          <Text style={[styles.tip, { color: colors.subtle }]}>Time left: {leftText}</Text>
        ) : (
          <Text style={[styles.tip, { color: colors.subtle }]}>
            Tip: Small, steady sips of water help prevent dehydration — a common migraine trigger.
          </Text>
        )}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[textStyles.h3, { color: colors.text, marginBottom: 8 }]}>Quick Tips</Text>
          <Text style={[styles.li, { color: colors.text }]}>• Dim screen and reduce noise.</Text>
          <Text style={[styles.li, { color: colors.text }]}>• Small sips of water.</Text>
          <Text style={[styles.li, { color: colors.text }]}>• Cool pack on neck or warm hands.</Text>
          <Text style={[styles.li, { color: colors.text }]}>• 4 in / 6 out breathing for 1 min.</Text>
        </View>
      </ScrollView>

      {dimOn && (
        <Pressable onPress={() => setDimOn(false)} style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(0,0,0,${dimLevel})` }]} accessibilityLabel="Exit dim mode" />
      )}

      <Pressable onPress={() => setDimOn(!dimOn)} style={[styles.fab, { backgroundColor: dimOn ? colors.accentBg : colors.card, borderColor: colors.border }]} accessibilityLabel="Toggle ultra-dim">
        <Text style={{ color: dimOn ? colors.accentText : colors.text }}>{dimOn ? 'Dim: On' : 'Dim: Off'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 4, marginBottom: 12, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pill: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24 },
  pillText: { fontSize: 16, fontWeight: '600' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  step: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  midText: { marginHorizontal: 12, fontSize: 16 },
  start: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  tip: { marginTop: 8, fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 16 },
  li: { fontSize: 16, marginBottom: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
});
