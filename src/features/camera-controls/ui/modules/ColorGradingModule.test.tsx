import React from 'react';
import { render } from '@testing-library/react-native';
import { ColorGradingModule } from './ColorGradingModule';
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

describe('ColorGradingModule', () => {
  const mockProps = {
    activeParameter: 'saturation' as ParameterType,
    setActiveParameter: jest.fn(),
    saturation: { value: 1.0 } as any,
    setSaturation: jest.fn(),
    contrast: { value: 1.0 } as any,
    setContrast: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ColorGradingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
