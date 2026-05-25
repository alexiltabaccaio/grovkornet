import React from 'react';
import { render } from '@testing-library/react-native';
import { ChromaticAberrationDetailPanel } from './ChromaticAberrationDetailPanel';

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
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      aberrationDirection: { value: 0 },
      setAberrationDirection: jest.fn(),
      aberrationInvert: { value: false },
      setAberrationInvert: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateAberrationDirection: jest.fn(),
    updateAberrationInvert: jest.fn(),
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: false };
    return fn ? fn(state) : state;
  }),
}));

describe('ChromaticAberrationDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ChromaticAberrationDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
