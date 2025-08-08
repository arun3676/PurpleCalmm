import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function soft() {
  if (Platform.OS === 'web') return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); } catch {}
}

export async function success() {
  if (Platform.OS === 'web') return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function selection() {
  if (Platform.OS === 'web') return;
  try { await Haptics.selectionAsync(); } catch {}
}
