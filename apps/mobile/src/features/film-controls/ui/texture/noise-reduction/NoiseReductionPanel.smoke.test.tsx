import React from 'react';
import { render } from '@testing-library/react-native';
import { NoiseReductionPanel } from './NoiseReductionPanel';

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: { noiseReductionMode: { value: number }; setNoiseReductionMode: jest.Mock; noiseReductionAuto: { value: boolean }; setNoiseReductionAuto: jest.Mock }) => unknown) => {
    const state = {
      noiseReductionMode: { value: 1 },
      setNoiseReductionMode: jest.fn(),
      noiseReductionAuto: { value: true },
      setNoiseReductionAuto: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: false };
    return fn ? fn(state) : state;
  }),
  ParameterPanelWrapper: 'ParameterPanelWrapper',
  GenericPillPanel: 'GenericPillPanel',
}));

describe('NoiseReductionPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<NoiseReductionPanel />);
    expect(toJSON()).toBeDefined();
  });
});
