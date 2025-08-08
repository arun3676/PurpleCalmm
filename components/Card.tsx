import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

export default function Card({ title, subtitle, onPress, right }: Props) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 }]} android_ripple={{ color: colors.primaryDark }}>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.h2, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={{ marginLeft: 12 }}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center'
  }
});
