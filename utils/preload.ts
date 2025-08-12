import { Asset } from 'expo-asset';
export async function preloadSplash() {
  try {
    await Asset.fromModule(require('../assets/splash_cat.jpeg')).downloadAsync();
  } catch {}
}


