import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { selection } from '../utils/haptics';

export default function PawButton({ label, onPress, small = false }: { label: string; onPress?: () => void; small?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={async () => { try { await selection(); } catch {} onPress?.(); }}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, alignSelf: 'flex-start' }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          backgroundColor: colors.primaryDark,
          borderRadius: 999,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 14 : 18,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={[textStyles.bodyMedium, { color: colors.text }]}>🐾 {label}</Text>
      </View>
    </Pressable>
  );
}
