import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

export default function CatHero() {
  const { colors } = useAppTheme();
  return (
    <View style={{ backgroundColor: colors.primaryDarker, borderRadius: 16, padding: 16, overflow: 'hidden' }}>
      <View style={{ height: 160, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' }}>
        {/* Whiskers */}
        <Svg width={260} height={160} style={{ position: 'absolute' }}>
          <Line x1="210" y1="78" x2="250" y2="68" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" />
          <Line x1="210" y1="82" x2="252" y2="82" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" />
          <Line x1="210" y1="86" x2="250" y2="96" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" />
          {/* Ears */}
          <Path d="M70 36 L98 56 L90 12 Z" fill={colors.primary} />
          <Path d="M190 36 L162 56 L170 12 Z" fill={colors.primary} />
        </Svg>
        <Text style={[textStyles.h1, { color: colors.text }]}>Purrple Calm</Text>
        <Text style={[textStyles.body, { color: colors.mutedText }]}>Your cozy cat comfort space</Text>
      </View>
    </View>
  );
}
