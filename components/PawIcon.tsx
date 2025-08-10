import React from 'react';
import { View } from 'react-native';

export default function PawIcon({ size = 18, color = '#7C55F5' }: { size?: number; color?: string }) {
  const toe = size * 0.35;
  const pad = size * 0.6;
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={{ width: pad, height: pad * 0.75, borderRadius: pad, backgroundColor: color, position: 'absolute', bottom: 0, left: (size - pad) / 2, opacity: 0.95 }} />
      {[-1.1, 0, 1.1].map((x, i) => (
        <View key={i} style={{ width: toe, height: toe, borderRadius: toe, backgroundColor: color, position: 'absolute', top: 0, left: size / 2 + x * toe - toe / 2, opacity: 0.95 }} />
      ))}
      {[-1.8, 1.8].map((x, i) => (
        <View key={`f${i}`} style={{ width: toe * 0.8, height: toe * 0.8, borderRadius: toe, backgroundColor: color, position: 'absolute', top: toe * 0.15, left: size / 2 + x * toe - (toe * 0.8) / 2, opacity: 0.95 }} />
      ))}
    </View>
  );
}
