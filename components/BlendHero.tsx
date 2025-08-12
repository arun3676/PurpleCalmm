import React from "react";
import { View, Platform, ImageBackground, StyleSheet } from "react-native";

type Props = {
  src: string;                           // e.g. "/assets/splash_cat.jpeg"
  focus?: { xPct: number; yPct: number }; // 0..100 – keep subject in view
  height?: number;                       // visible hero height
  overlay?: string;                      // color wash for readability
  blurPx?: number;                       // subtle softness
  fadeStop?: number;                     // 0..1 – where fade starts
};

export default function BlendHero({
  src,
  focus = { xPct: 60, yPct: 64 },
  height = 260,
  overlay = "rgba(237,230,255,0.42)",
  blurPx = 1.2,
  fadeStop = 0.68,
}: Props) {
  const containerH = height + 40;

  if (Platform.OS !== "web") {
    // RN-web/native fallback (no CSS mask)
    return (
      <ImageBackground
        source={{ uri: src }}
        resizeMode="cover"
        style={{ height: containerH, justifyContent: "flex-start" }}
        imageStyle={{ opacity: 0.96 }}
      >
        <View style={{ height }} />
        <View style={{ ...StyleSheet.absoluteFillObject, top: 0, height, backgroundColor: overlay }} />
      </ImageBackground>
    );
  }

  // Web: keep faces in frame and fade image into page bg
  const pos = `${clamp(focus.xPct, 0, 100)}% ${clamp(focus.yPct, 0, 100)}%`;
  const mask = `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${Math.round(
    fadeStop * 100
  )}%, rgba(0,0,0,0) 100%)`;

  return (
    <View style={{ height: containerH, position: "relative" }}>
      <View
        // @ts-expect-error: web-only CSS props
        style={{
          height: containerH,
          backgroundImage: `url("${src}?v=5")`,
          backgroundSize: "cover",
          backgroundPosition: pos,
          backgroundRepeat: "no-repeat",
          filter: `blur(${blurPx}px)`,
          WebkitMaskImage: mask,
          maskImage: mask,
          backgroundAttachment: isDesktop() ? "fixed" : "scroll",
        }}
      />
      <View style={{ ...StyleSheet.absoluteFillObject, height, backgroundColor: overlay }} />
    </View>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}


