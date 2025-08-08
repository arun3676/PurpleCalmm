import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleIn(minutes: number, title: string, body?: string) {
  if (Platform.OS === 'web') {
    alert(`${title}\n${body ?? ''}`);
    return;
  }
  const ok = await ensurePermission();
  if (!ok) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds: minutes * 60 }
  });
}
