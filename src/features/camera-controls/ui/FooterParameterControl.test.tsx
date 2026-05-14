import React from 'react';
import { render } from '@testing-library/react-native';
import { FooterParameterControl } from './FooterParameterControl';

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
  const { View } = jest.requireActual('react-native');
  return {
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Pan: () => ({
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
      }),
      LongPress: () => ({
        onStart: jest.fn().mockReturnThis(),
      }),
      Race: jest.fn(),
    },
  };
});

describe('FooterParameterControl', () => {
  const mockProps = {
    label: 'ISO',
    isActive: true,
    onPress: jest.fn(),
    value: { value: 100 } as any,
    variant: 'text' as const,
  };

  it('renders correctly without value prop in AnimatedTextInput', () => {
    const { toJSON } = render(<FooterParameterControl {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
