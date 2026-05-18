import React from 'react';
import { render } from '@testing-library/react-native';
import { LanguageSubPanel } from './LanguageSubPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeSubParameter: string; setActiveSubParameter: jest.Mock }) => unknown) => {
    const state = {
      activeSubParameter: 'lang_en',
      setActiveSubParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('LanguageSubPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LanguageSubPanel animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
  });
});
