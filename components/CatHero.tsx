import React from "react";
import { View, Platform, ImageBackground } from "react-native";

type Props = {
  src: string; // e.g. "/assets/splash_cat.jpeg"
  focus?: { xPct: number; yPct: number };
  height?: number;
  overlay?: string;
  children?: React.ReactNode;
};

export default function CatHero({
  src,
  focus = { xPct: 60, yPct: 64 },
  height = 260,
  overlay = "rgba(237,230,255,0.45)",
  children
}: Props) {
  if (Platform.OS !== "web") {
    return (
      <ImageBackground
        source={{ uri: src }}
        resizeMode="cover"
        style={{ height, justifyContent: "center", borderRadius: 24, overflow: "hidden" }}
        imageStyle={{ opacity: 0.95 }}
      >
        <View style={{ ...ABS, backgroundColor: overlay }} />
        {children}
      </ImageBackground>
    );
  }

  const pos = `${clamp(focus.xPct, 0, 100)}% ${clamp(focus.yPct, 0, 100)}%`;
  return (
    <View
      style={{
        height,
        justifyContent: "center",
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        backgroundImage: `url("${src}?v=3")` as any,
        backgroundSize: "cover" as any,
        backgroundPosition: pos as any,
        backgroundRepeat: "no-repeat" as any
      } as any}
    >
      <View style={{ ...ABS, backgroundColor: overlay }} />
      {children}
    </View>
  );
}

const ABS = { position: "absolute" as const, top: 0, right: 0, bottom: 0, left: 0 };
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

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
