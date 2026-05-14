import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainModule } from './GrainModule';
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

describe('GrainModule', () => {
  const mockProps = {
    activeParameter: 'grain' as ParameterType,
    setActiveParameter: jest.fn(),
    grainIntensity: { value: 0.5 } as any,
    setGrainIntensity: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<GrainModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
