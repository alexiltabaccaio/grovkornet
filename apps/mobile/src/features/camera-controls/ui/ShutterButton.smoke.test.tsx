import React from 'react';
import { render } from '@testing-library/react-native';
import { ShutterButton } from './ShutterButton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

describe('ShutterButton Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ShutterButton onPress={jest.fn()} />);
    expect(toJSON()).toBeDefined();
  });
});
