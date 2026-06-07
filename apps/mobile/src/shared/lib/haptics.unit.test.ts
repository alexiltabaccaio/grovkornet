import * as Haptics from 'expo-haptics';
import {
  setHapticsEnabledChecker,
  impactAsync,
  notificationAsync,
  selectionAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from './haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('haptics library wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHapticsEnabledChecker(() => true); // Reset to default enabled
  });

  describe('default behavior (no custom checker / checker returns true)', () => {
    it('triggers impactAsync correctly', async () => {
      await impactAsync(ImpactFeedbackStyle.Light);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
    });

    it('triggers notificationAsync correctly', async () => {
      await notificationAsync(NotificationFeedbackType.Success);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(NotificationFeedbackType.Success);
    });

    it('triggers selectionAsync correctly', async () => {
      await selectionAsync();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('disabled behavior (checker returns false)', () => {
    beforeEach(() => {
      setHapticsEnabledChecker(() => false);
    });

    it('does not trigger impactAsync', async () => {
      await impactAsync(ImpactFeedbackStyle.Light);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('does not trigger notificationAsync', async () => {
      await notificationAsync(NotificationFeedbackType.Success);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });

    it('does not trigger selectionAsync', async () => {
      await selectionAsync();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    });
  });
});
