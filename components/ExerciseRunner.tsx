import React from 'react';
import { Modal, View, Text, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

type Step = { label: string; seconds: number };
type Props = {
  visible: boolean;
  title: string;
  steps: Step[];
  colors: any;
  textStyles: any;
  onClose: () => void;
};

export default function ExerciseRunner({ visible, title, steps, colors, textStyles, onClose }: Props) {
  const [i, setI] = React.useState(0);
  const [left, setLeft] = React.useState(steps[0]?.seconds ?? 0);
  const [running, setRunning] = React.useState(false);
  const bar = React.useRef(new Animated.Value(0)).current;
  const tickRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (visible) {
      setI(0);
      setLeft(steps[0]?.seconds ?? 0);
      setRunning(false);
      bar.setValue(0);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
  }, [visible]);

  function fmt(s: number) { return String(Math.max(0, Math.ceil(s))).padStart(2, '0'); }

  async function start() {
    if (!steps[i]) return;
    setRunning(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(()=>{});
    const duration = steps[i].seconds;
    bar.setValue(0);
    Animated.timing(bar, { toValue: 1, duration: duration*1000, useNativeDriver: false }).start();
    const t0 = Date.now();
    tickRef.current = setInterval(() => {
      const s = duration - (Date.now() - t0)/1000;
      if (s <= 0) { clearInterval(tickRef.current); next(); }
      else setLeft(s);
    }, 200);
  }

  function pause() {
    setRunning(false);
    if (tickRef.current) clearInterval(tickRef.current);
  }

  async function next() {
    if (tickRef.current) clearInterval(tickRef.current);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
    if (i+1 >= steps.length) { onClose(); return; }
    const ni = i+1;
    setI(ni);
    setLeft(steps[ni].seconds);
    setRunning(false);
    bar.setValue(0);
  }

  const pct = bar.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex:1, backgroundColor:'#0008', alignItems:'center', justifyContent:'center', padding:16 }}>
        <View style={{ width:'100%', maxWidth:420, backgroundColor: colors.background, borderRadius:18, padding:16 }}>
          <Text style={[textStyles.h2, { color: colors.text }]}>{title}</Text>
          <Text style={[textStyles.body, { color: colors.mutedText, marginTop:4 }]}>Step {i+1} / {steps.length}</Text>

          <View style={{ marginTop:16, backgroundColor: colors.surface, borderRadius:12, padding:14 }}>
            <Text style={[textStyles.h2, { color: colors.text, textAlign:'center' }]}>{steps[i]?.label}</Text>
            <Text style={[textStyles.h1, { color: colors.text, textAlign:'center', marginTop:8 }]}>{fmt(left)}s</Text>

            <View style={{ height:8, backgroundColor:'#00000010', borderRadius:5, overflow:'hidden', marginTop:12 }}>
              <Animated.View style={{ height:'100%', width:pct, backgroundColor: colors.primary }} />
            </View>
          </View>

          <View style={{ flexDirection:'row', gap:10, marginTop:14 }}>
            {!running ? (
              <Pressable onPress={start} style={{ backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:14, borderRadius:12 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>Start</Text>
              </Pressable>
            ) : (
              <Pressable onPress={pause} style={{ backgroundColor: colors.surface, paddingVertical:10, paddingHorizontal:14, borderRadius:12 }}>
                <Text style={[textStyles.body, { color: colors.text }]}>Pause</Text>
              </Pressable>
            )}
            <Pressable onPress={next} style={{ backgroundColor: colors.surface, paddingVertical:10, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>Skip</Text>
            </Pressable>
            <Pressable onPress={onClose} style={{ marginLeft:'auto', backgroundColor:'#00000012', paddingVertical:10, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={[textStyles.body, { color: colors.text }]}>Done</Text>
            </Pressable>
          </View>

          <Text style={[{ fontSize:12 }, { color: colors.mutedText, marginTop:10 }]}>Tip: Stop if pain worsens. Sudden severe headache → seek medical care.</Text>
        </View>
      </View>
    </Modal>
  );
}
