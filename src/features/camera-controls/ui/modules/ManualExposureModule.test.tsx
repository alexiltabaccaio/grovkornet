import React from 'react';
import { render } from '@testing-library/react-native';
import { ManualExposureModule } from './ManualExposureModule';
import { ParameterType } from '@shared/types/camera';

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

jest.mock('../FooterParameterControl', () => ({
  FooterParameterControl: 'FooterParameterControl',
}));

describe('ManualExposureModule', () => {
  const mockProps = {
    activeParameter: 'iso' as ParameterType,
    setActiveParameter: jest.fn(),
    iso: { value: 100 } as any,
    setIso: jest.fn(),
    isoAuto: { value: true } as any,
    setIsoAuto: jest.fn(),
    ev: { value: 0 } as any,
    setEv: jest.fn(),
    evAuto: { value: true } as any,
    setEvAuto: jest.fn(),
    shutterSpeed: { value: 60 } as any,
    setShutterSpeed: jest.fn(),
    shutterSpeedAuto: { value: true } as any,
    setShutterSpeedAuto: jest.fn(),
    whiteBalance: { value: 5000 } as any,
    setWhiteBalance: jest.fn(),
    whiteBalanceAuto: { value: true } as any,
    setWhiteBalanceAuto: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ManualExposureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
