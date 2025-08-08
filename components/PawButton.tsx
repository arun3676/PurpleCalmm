import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

export default function PawButton({ label, onPress, small = false }: { label: string; onPress?: () => void; small?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, alignSelf: 'flex-start' }]}>
      <View
        style={{
          backgroundColor: colors.primaryDark,
          borderRadius: 999,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 14 : 18
        }}
      >
        <Text style={[textStyles.bodyMedium, { color: colors.text }]}>🐾 {label}</Text>
      </View>
    </Pressable>
  );
}
