import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  level: 0.3 | 0.5 | 0.7;
  onLevelChange: (lvl: 0.3 | 0.5 | 0.7) => void;
  onExit: () => void;
  reduceMotion?: boolean;
};

export default function DimOverlay({ visible, level, onLevelChange, onExit, reduceMotion }: Props) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const to = visible ? level : 0;
    if (reduceMotion) {
      a.setValue(to);
    } else {
      Animated.timing(a, { toValue: to, duration: 180, useNativeDriver: false }).start();
    }
  }, [visible, level, reduceMotion]);

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: a }]}>
      {visible && (
        <View style={s.panel}>
          <View style={s.row}>
            {[0.3, 0.5, 0.7].map((v) => (
              <Pressable key={v}
                accessibilityLabel={`Set dim ${Math.round((v as number)*100)}%`}
                onPress={() => onLevelChange(v as 0.3|0.5|0.7)}
                style={[s.chip, level === v && s.chipOn]}>
                <Text style={[s.chipText, level === v && s.chipTextOn]}>{Math.round((v as number)*100)}%</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityLabel="Exit ultra-dim" onPress={onExit} style={s.exit}>
            <Text style={s.exitText}>Exit dim</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  panel:{ position:'absolute', bottom:24, left:16, right:16, alignItems:'center' },
  row:{ flexDirection:'row', gap:12, marginBottom:16 },
  chip:{ paddingVertical:10, paddingHorizontal:16, borderRadius:24, backgroundColor:'#262626' },
  chipOn:{ backgroundColor:'#8b5cf6' },
  chipText:{ color:'#e5e5e5', fontSize:16 },
  chipTextOn:{ color:'white', fontWeight:'600' },
  exit:{ backgroundColor:'#8b5cf6', borderRadius:28, paddingVertical:14, paddingHorizontal:28 },
  exitText:{ color:'white', fontSize:18, fontWeight:'700' },
});


