import React from 'react';
import { View } from 'react-native';
import PawChip from './PawChip';

export default function CategoryGrid() {
  const items = ['Shampoo', 'Toys', 'Beds', 'Scratchers', 'Food', 'Supplements'];
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12 }}>
        {items.map((name) => (
          <PawChip key={name} label={name} onPress={() => {}} />
        ))}
      </View>
    </View>
  );
}
