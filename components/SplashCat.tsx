import React, { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";

type SplashCatProps = {
  visible: boolean;
  src: string;          // e.g. "/assets/loading_cat.png"
  bg?: string;          // background color
};

export default function SplashCat({ visible, src, bg = "#F6EBDD" }: SplashCatProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={{
        position: "absolute",
        inset: 0 as any,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        opacity,
        zIndex: 9999,
      }}
    >
      <View style={{ alignItems: "center", gap: 16 }}>
        <Image
          source={{ uri: src }}
          resizeMode="contain"
          style={{ width: 152, height: 152 }}
        />
      </View>
    </Animated.View>
  );
}


