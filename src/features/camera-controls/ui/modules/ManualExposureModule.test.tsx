import React from 'react';
import { render } from '@testing-library/react-native';
import { ManualExposureModule } from './ManualExposureModule';
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

describe('ManualExposureModule', () => {
  const mockProps = {
    activePrimaryParameter: 'iso' as PrimaryParameterType,
    setActivePrimaryParameter: jest.fn(),
    iso: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setIso: jest.fn(),
    isoAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setIsoAuto: jest.fn(),
    ev: { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setEv: jest.fn(),
    evAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setEvAuto: jest.fn(),
    shutterSpeed: { value: 60 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setShutterSpeed: jest.fn(),
    shutterSpeedAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setShutterSpeedAuto: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ManualExposureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
