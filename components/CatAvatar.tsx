import React from 'react';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';
import { View, Text } from 'react-native';
import { useAppTheme, textStyles } from '../theme/ThemeProvider';

export default function CatAvatar({ moodLevel = 0 }: { moodLevel?: number }) {
  const { colors } = useAppTheme();
  const face = Math.max(0, Math.min(1, moodLevel)); // 0..1
  const mouthCurve = 4 + face * 6;
  const eyeY = 20 - face * 2;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <Circle cx="32" cy="32" r="30" fill={colors.primaryDarker} />
        <Path d="M8 10 L18 18 L12 4 Z" fill={colors.primaryDark} />
        <Path d="M56 10 L46 18 L52 4 Z" fill={colors.primaryDark} />
        <Ellipse cx="24" cy={eyeY} rx="4" ry="6" fill="#fff" />
        <Ellipse cx="40" cy={eyeY} rx="4" ry="6" fill="#fff" />
        <Circle cx="24" cy={eyeY + 1} r="2" fill="#000" />
        <Circle cx="40" cy={eyeY + 1} r="2" fill="#000" />
        <Path d={`M24 40 Q32 ${40 + mouthCurve} 40 40`} stroke="#000" strokeWidth="2" fill="none" />
        <Circle cx="32" cy="34" r="2" fill="#000" />
      </Svg>
      <Text style={[textStyles.body, { color: colors.mutedText, marginTop: 6 }]}>{face > 0.66 ? 'Purrfect!' : face > 0.33 ? 'Content' : 'Needs cuddles'}</Text>
    </View>
  );
}
