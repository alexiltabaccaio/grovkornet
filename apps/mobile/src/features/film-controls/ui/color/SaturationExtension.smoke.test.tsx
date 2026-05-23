import React from 'react';
import { render } from '@testing-library/react-native';
import { SaturationExtension } from './SaturationExtension';

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
  ParameterControl: 'ParameterControl',
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      satRed: { value: 50.0 },
      setSatRed: jest.fn(),
      satOrange: { value: 50.0 },
      setSatOrange: jest.fn(),
      satYellow: { value: 50.0 },
      setSatYellow: jest.fn(),
      satGreen: { value: 50.0 },
      setSatGreen: jest.fn(),
      satCyan: { value: 50.0 },
      setSatCyan: jest.fn(),
      satBlue: { value: 50.0 },
      setSatBlue: jest.fn(),
      satPurple: { value: 50.0 },
      setSatPurple: jest.fn(),
      satMagenta: { value: 50.0 },
      setSatMagenta: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateSatRed: jest.fn(),
  }),
}));

describe('SaturationExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<SaturationExtension />);
    expect(toJSON()).toBeDefined();
  });
});
