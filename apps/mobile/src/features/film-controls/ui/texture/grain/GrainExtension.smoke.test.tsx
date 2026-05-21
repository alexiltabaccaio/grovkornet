import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainExtension } from './GrainExtension';

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
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = {
      isDebugEnabled: false,
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: { grainChroma: { value: number }; setGrainChroma: jest.Mock; grainSize: { value: number }; setGrainSize: jest.Mock }) => unknown) => {
    const state = {
      grainChroma: { value: 0 },
      setGrainChroma: jest.fn(),
      grainSize: { value: 2.0 },
      setGrainSize: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateGrainChroma: jest.fn(),
    updateGrainSize: jest.fn(),
  }),
}));

describe('GrainExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GrainExtension />);
    expect(toJSON()).toBeDefined();
  });
});
