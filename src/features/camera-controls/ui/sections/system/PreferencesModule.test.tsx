import React from 'react';
import { render } from '@testing-library/react-native';
import { PreferencesModule } from './PreferencesModule';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));


jest.mock('@shared/ui', () => ({
  LanguageThumb: 'LanguageThumb',
  DebugThumb: 'DebugThumb',
}));

describe('PreferencesModule', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <PreferencesModule />
    );
    expect(toJSON()).toBeDefined();
  });
});
