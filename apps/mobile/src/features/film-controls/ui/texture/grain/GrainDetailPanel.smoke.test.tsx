import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainDetailPanel } from './GrainDetailPanel';

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
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      grainChroma: { value: 0 },
      setGrainChroma: jest.fn(),
      grainSize: { value: 2.0 },
      setGrainSize: jest.fn(),
      grainSpeed: { value: 1.0 },
      setGrainSpeed: jest.fn(),
      grainRoughness: { value: 0.0 },
      setGrainRoughness: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateGrainChroma: jest.fn(),
    updateGrainSize: jest.fn(),
    updateGrainSpeed: jest.fn(),
    updateGrainRoughness: jest.fn(),
  }),
}));

describe('GrainDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GrainDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
