import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ClassicLilac } from '../theme/palette';

export default function PurrpleHero({ title = 'Purrple Calm', subtitle = 'Your cozy cat comfort space', }: { title?: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View
        style={{
          borderRadius: 24,
          backgroundColor: ClassicLilac.pageBg,
          padding: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <View style={{ borderRadius: 20, overflow: 'hidden' }}>
          <LinearGradient
            colors={[ClassicLilac.cardBgTop, ClassicLilac.cardBgBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, paddingVertical: 28, paddingHorizontal: 20, position: 'relative' }}
          >
            {/* Ears */}
            <View style={{ position: 'absolute', top: 10, left: 26, width: 22, height: 22, backgroundColor: '#E9D6FF', transform: [{ rotate: '45deg' }], borderRadius: 4, opacity: 0.9 }} />
            <View style={{ position: 'absolute', top: 10, left: 58, width: 22, height: 22, backgroundColor: '#E9D6FF', transform: [{ rotate: '45deg' }], borderRadius: 4, opacity: 0.9 }} />
            {/* Whiskers */}
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ position: 'absolute', right: 16, top: 36 + i * 10, width: 70 - i * 8, height: 3, backgroundColor: '#F6EFFF', borderRadius: 3, opacity: 0.9 }} />
            ))}

            <Text style={{ fontSize: 30, lineHeight: 38, color: ClassicLilac.title, fontWeight: '700', letterSpacing: 0.5 }}>{title}</Text>
            <Text style={{ marginTop: 4, fontSize: 16, color: ClassicLilac.subtitle }}>{subtitle}</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}
