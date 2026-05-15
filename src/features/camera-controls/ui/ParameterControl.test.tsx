import React from 'react';
import { render } from '@testing-library/react-native';
import { ParameterControl } from './ParameterControl';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    ...jest.requireActual('react-native-reanimated/mock'),
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    createAnimatedComponent: jest.fn((comp) => comp),
    default: {
      View: View,
      Text: Text,
      createAnimatedComponent: jest.fn((comp) => comp),
    },
  };
});

jest.mock('react-native-gesture-handler', () => {
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        hitSlop: jest.fn().mockReturnThis(),
        activeOffsetY: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
      }),
      LongPress: () => ({
        onStart: jest.fn().mockReturnThis(),
      }),
      Tap: () => ({
        onEnd: jest.fn().mockReturnThis(),
      }),
      Race: jest.fn(),
    },
  };
});

describe('ParameterControl', () => {
  const mockProps = {
    label: 'ISO',
    isActive: true,
    onPress: jest.fn(),
    value: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    variant: 'text' as const,
  };

  it('renders correctly without value prop in AnimatedTextInput', () => {
    const { toJSON } = render(<ParameterControl {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
