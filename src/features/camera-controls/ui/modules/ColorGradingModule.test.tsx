import React from 'react';
import { render } from '@testing-library/react-native';
import { ColorGradingModule } from './ColorGradingModule';
import { PrimaryParameterType } from '@shared/types/camera';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    View: View,
  };
});

jest.mock('../PrimaryParameterControl', () => ({
  PrimaryParameterControl: 'PrimaryParameterControl',
}));

describe('ColorGradingModule', () => {
  const mockProps = {
    activePrimaryParameter: 'saturation' as PrimaryParameterType,
    setActivePrimaryParameter: jest.fn(),
    saturation: { value: 1.0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setSaturation: jest.fn(),
    contrast: { value: 1.0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setContrast: jest.fn(),
    temperature: { value: 5000 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setTemperature: jest.fn(),
    temperatureAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setTemperatureAuto: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ColorGradingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
