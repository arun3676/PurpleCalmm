import * as Notifications from 'expo-notifications';

export async function ensureNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleOneShot(seconds: number, title: string, body: string) {
  await ensureNotificationPermissions();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds }
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}


