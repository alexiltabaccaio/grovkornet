import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '@entities/preferences';

const isHapticsEnabled = () => {
  const { hapticsEnabled } = usePreferencesStore.getState();
  // Se è null, di default è true.
  return hapticsEnabled !== false;
};

export const impactAsync = async (style?: Haptics.ImpactFeedbackStyle) => {
  if (!isHapticsEnabled()) return;
  return Haptics.impactAsync(style);
};

export const notificationAsync = async (type?: Haptics.NotificationFeedbackType) => {
  if (!isHapticsEnabled()) return;
  return Haptics.notificationAsync(type);
};

export const selectionAsync = async () => {
  if (!isHapticsEnabled()) return;
  return Haptics.selectionAsync();
};

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
