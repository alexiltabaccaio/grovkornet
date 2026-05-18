import React from 'react';
import { render } from '@testing-library/react-native';
import { LanguageParam } from './LanguageParam';

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
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'language',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('LanguageParam', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LanguageParam />);
    expect(toJSON()).toBeDefined();
  });
});
