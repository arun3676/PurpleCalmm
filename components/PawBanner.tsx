import React from 'react';
import { View, Text } from 'react-native';
import { ClassicLilac } from '../theme/palette';

function TallPaw({ color, h = 84 }: { color: string; h?: number }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: h }}>
      <View style={{ width: 30, height: 46, backgroundColor: color, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, position: 'relative' }} />
      <View style={{ position: 'absolute', bottom: 18, flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: '#FFFFFFAA' }} />
        ))}
      </View>
    </View>
  );
}

export default function PawBanner() {
  return (
    <View style={{ marginTop: 20, paddingVertical: 16, backgroundColor: '#D9CCFF', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'flex-end' }}>
        <TallPaw color="#B7A7FF" />
        <TallPaw color="#E2D7FF" h={72} />
        <View style={{ paddingHorizontal: 8, alignItems: 'center' }}>
          <Text style={{ color: ClassicLilac.title, fontWeight: '700' }}>We care for your pets</Text>
          <View style={{ marginTop: 6, backgroundColor: ClassicLilac.white, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 }}>
            <Text style={{ color: ClassicLilac.purpleDark, fontWeight: '600' }}>Consultation</Text>
          </View>
        </View>
        <TallPaw color="#9FA3FF" h={72} />
        <TallPaw color="#C6B8FF" />
      </View>
    </View>
  );
}
