import * as Haptics from 'expo-haptics';

let hapticsEnabledChecker: (() => boolean) | null = null;

export const setHapticsEnabledChecker = (checker: () => boolean) => {
  hapticsEnabledChecker = checker;
};

const isHapticsEnabled = () => {
  if (hapticsEnabledChecker) {
    return hapticsEnabledChecker();
  }
  // If no checker is registered, default to enabled.
  return true;
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
