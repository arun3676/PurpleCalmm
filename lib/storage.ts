import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveJSON<T>(key: string, val: T) {
  try { await AsyncStorage.setItem(key, JSON.stringify(val)); } catch {}
}
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}


