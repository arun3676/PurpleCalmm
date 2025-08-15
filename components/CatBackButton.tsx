import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

type Props = {
  onPress: () => void;
  style?: any;
};

export default function CatBackButton({ onPress, style }: Props) {
  const { colors } = useAppTheme();
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pressed ? colors.primaryDark : colors.primary,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          opacity: pressed ? 0.9 : 1,
          alignSelf: 'flex-start',
          borderWidth: 2,
          borderColor: colors.text + '20',
        },
        style
      ]}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Text style={[textStyles.bodyMedium, { 
        color: colors.text, 
        fontSize: 16,
        fontWeight: '600'
      }]}>
        🐾 ← Back
      </Text>
    </Pressable>
  );
}
