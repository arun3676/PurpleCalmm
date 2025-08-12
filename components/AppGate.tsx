import React, { useEffect, useState } from "react";
import { View } from "react-native";
import SplashCat from "./SplashCat";

type AppGateProps = {
  children: React.ReactNode;
  splashSrc: string;   // "/assets/loading_cat.png"
  minMs?: number;      // minimum time to show splash
};

export default function AppGate({ children, splashSrc, minMs = 800 }: AppGateProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Simulate hydration/font/settings; replace with your real hydration if needed
    const t = setTimeout(() => setReady(true), minMs);
    return () => clearTimeout(t);
  }, [minMs]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <SplashCat visible={!ready} src={splashSrc} />
    </View>
  );
}


