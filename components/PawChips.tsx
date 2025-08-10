import React from 'react';
import { View } from 'react-native';
import PawButton from './PawButton';

export type PawChip = { label: string; onPress: () => void };

export default function PawChips({ items }: { items: PawChip[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12 }}>
      {items.map((it, idx) => (
        <PawButton key={idx} label={it.label} onPress={it.onPress} />
      ))}
    </View>
  );
}
