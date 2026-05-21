import React from 'react';
import { render } from '@testing-library/react-native';
import { LanguageExtension } from './LanguageExtension';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { activeExtension: string; setActiveExtension: jest.Mock }) => unknown) => {
    const state = {
      activeExtension: 'lang_en',
      setActiveExtension: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
  ParameterExtensionWrapper: 'ParameterExtensionWrapper',
}));

describe('LanguageExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LanguageExtension animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
  });
});
