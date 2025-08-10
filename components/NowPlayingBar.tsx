import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';
import { stopAllSongs } from '../utils/audio';

export default function NowPlayingBar({ visible }: { visible: boolean }) {
  const { colors } = useAppTheme();
  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: colors.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
      <Text style={[textStyles.body, { color: colors.text }]}>🐾 Now Playing</Text>
      <Pressable onPress={async () => { await stopAllSongs(); }}>
        <Text style={[textStyles.bodyMedium, { color: colors.primaryDarker }]}>Stop</Text>
      </Pressable>
    </View>
  );
}
