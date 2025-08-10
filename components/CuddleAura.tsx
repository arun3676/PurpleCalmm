import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

export default function CuddleAura({ active, size = 180, color = 'rgba(162,139,255,0.25)' }: { active: boolean; size?: number; color?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (active) {
      const run = () => {
        scale.setValue(1);
        opacity.setValue(0.35);
        loop = Animated.parallel([
          Animated.timing(scale, { toValue: 1.3, duration: 1200, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: false })
        ]);
        loop.start(({ finished }) => { if (finished) run(); });
      };
      run();
    }
    return () => { try { loop?.stop?.(); } catch {} };
  }, [active]);

  const style: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    transform: [{ scale }],
    opacity,
  } as any;

  if (!active) return null;
  return <Animated.View pointerEvents="none" style={style} />;
}
