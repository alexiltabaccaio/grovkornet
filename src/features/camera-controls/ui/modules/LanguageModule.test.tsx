import React from 'react';
import { render } from '@testing-library/react-native';
import { LanguageModule } from './LanguageModule';

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

jest.mock('@shared/ui', () => ({
  LanguageThumb: 'LanguageThumb',
}));

describe('LanguageModule', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LanguageModule />);
    expect(toJSON()).toBeDefined();
  });
});
