import React from 'react';
import { render } from '@testing-library/react-native';
import { ChromaticAberrationExtension } from './ChromaticAberrationExtension';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: { aberrationDirection: { value: number }; setAberrationDirection: jest.Mock }) => unknown) => {
    const state = {
      aberrationDirection: { value: 0 },
      setAberrationDirection: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateAberrationDirection: jest.fn(),
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: false };
    return fn ? fn(state) : state;
  }),
}));

describe('ChromaticAberrationExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ChromaticAberrationExtension />);
    expect(toJSON()).toBeDefined();
  });
});
