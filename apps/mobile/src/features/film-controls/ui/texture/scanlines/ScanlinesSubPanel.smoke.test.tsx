import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanlinesSubPanel } from './ScanlinesSubPanel';

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
  useSystemStore: jest.fn((fn?: (state: { isLayoutOverlayEnabled: boolean }) => unknown) => {
    const state = {
      isLayoutOverlayEnabled: false,
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
  ParameterDetailPanelWrapper: 'ParameterDetailPanelWrapper',
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      scanlinesMode: { value: 0 },
      setScanlinesMode: jest.fn(),
      scanlinesDensity: { value: 800.0 },
      setScanlinesDensity: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateScanlinesMode: jest.fn(),
    updateScanlinesDensity: jest.fn(),
  }),
}));

describe('ScanlinesSubPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ScanlinesSubPanel />);
    expect(toJSON()).toBeDefined();
  });
});
