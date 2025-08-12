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

// removed legacy hero implementation
