import React from 'react';
import { View, Text, ImageBackground, Animated, Easing, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  progress: number;     // 0..100
  tip?: string | null;
  onSkip?: () => void;  // optional "Enter" button
};

export default function SplashScreen({ visible, progress, tip, onSkip }: Props) {
  const bar = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(bar, {
      toValue: Math.max(0, Math.min(1, progress / 100)),
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  if (!visible) return null;

  const width = bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={{
      position: 'fixed' as any,
      inset: 0 as any,
      backgroundColor: '#EDE6FF',
      zIndex: 9999 as any
    }}>
      <ImageBackground
        source={{ uri: '/assets/splash_cat.jpg' }}
        resizeMode="cover"
        style={{ flex: 1, justifyContent: 'center' }}
        imageStyle={{ opacity: 0.6 }}
      >
        {/* soft overlay */}
        <View style={{
          ...(StyleSheet as any).absoluteFillObject,
          backgroundColor: 'rgba(237,230,255,0.55)'
        }} />

        {/* center card */}
        <View style={{
          marginHorizontal: 24,
          padding: 20,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.65)',
          borderWidth: 1,
          borderColor: '#CFC0FF',
          shadowColor: 'rgba(40,22,95,0.25)',
          shadowOpacity: 1,
          shadowRadius: 24,
          maxWidth: 520,
          alignSelf: 'center'
        }}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: '#190F2A', textAlign: 'center' }}>
            Purrple Calm
          </Text>
          <Text style={{ fontSize: 16, color: '#574A79', textAlign: 'center', marginTop: 6 }}>
            Your cozy cat comfort space
          </Text>

          {/* paws progress */}
          <View style={{ marginTop: 18, backgroundColor: '#ECE6FF', height: 10, borderRadius: 999, overflow: 'hidden' }}>
            <Animated.View style={{ width, height: '100%', backgroundColor: '#6B3CFF' }} />
          </View>

          <Text style={{ textAlign: 'center', color: '#574A79', marginTop: 8 }}>
            {tip || 'Getting cozy…'}
          </Text>

          {onSkip && (
            <Pressable onPress={onSkip} style={{
              alignSelf: 'center',
              marginTop: 14,
              backgroundColor: '#6B3CFF',
              paddingVertical: 10, paddingHorizontal: 18,
              borderRadius: 14
            }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Enter</Text>
            </Pressable>
          )}
        </View>

        {/* subtle ears / whiskers hint at top (Sirius vibe) */}
        <View style={{ position: 'absolute', top: 36, left: 24, right: 24, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 22,
              borderStyle: 'solid', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#D8CCFF', opacity: 0.9 }} />
            <View style={{ width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 22,
              borderStyle: 'solid', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#D8CCFF', opacity: 0.9 }} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// tiny RN web shim
const StyleSheet = { absoluteFillObject: { position:'absolute', top:0, right:0, bottom:0, left:0 } };


