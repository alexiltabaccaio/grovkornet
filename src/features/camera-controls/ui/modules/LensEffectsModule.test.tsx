import React from 'react';
import { render } from '@testing-library/react-native';
import { LensEffectsModule } from './LensEffectsModule';
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

describe('LensEffectsModule', () => {
  const mockProps = {
    activeParameter: 'chromatic_aberration' as ParameterType,
    setActiveParameter: jest.fn(),
    chromaticAberration: { value: 0 } as any,
    setChromaticAberration: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<LensEffectsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
