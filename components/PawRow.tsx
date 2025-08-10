import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeProvider';

export default function PawRow() {
  const { colors } = useAppTheme();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={320} height={64}>
        <Path d="M20 60 Q30 40 40 60 T60 60" fill={colors.primaryDark} />
        <Path d="M90 60 Q100 38 110 60 T130 60" fill={colors.primaryDark} />
        <Path d="M160 60 Q170 42 180 60 T200 60" fill={colors.primaryDark} />
        <Path d="M230 60 Q240 36 250 60 T270 60" fill={colors.primaryDark} />
      </Svg>
    </View>
  );
}
