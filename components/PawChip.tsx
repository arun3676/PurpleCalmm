import React from 'react';
import { Pressable, Text } from 'react-native';
import PawIcon from './PawIcon';
import { ClassicLilac } from '../theme/palette';

export default function PawChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: ClassicLilac.chipBg,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: ClassicLilac.chipShadow,
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <PawIcon size={16} color={ClassicLilac.purple} />
      <Text style={{ color: ClassicLilac.chipText, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
