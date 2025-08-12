import React from 'react';
import { View, Text, ImageBackground } from 'react-native';

// Metro-bundled asset (works on web + native)
const SPLASH_IMG = require('../assets/splash_cat.jpeg');

export default function SplashScreen() {
  return (
    <ImageBackground
      source={SPLASH_IMG}
      resizeMode="cover"
      style={{ flex: 1, justifyContent: 'center' }}
      imageStyle={{ opacity: 0.55 }}
    >
      <View style={{ backgroundColor:'rgba(237,230,255,0.35)', padding:20, margin:24, borderRadius:20 }}>
        <Text style={{ fontSize:32, fontWeight:'800', textAlign:'center' }}>Purrple Calm</Text>
        <Text style={{ fontSize:16, opacity:0.8, textAlign:'center', marginTop:6 }}>
          Your cozy cat comfort space
        </Text>
      </View>
    </ImageBackground>
  );
}


