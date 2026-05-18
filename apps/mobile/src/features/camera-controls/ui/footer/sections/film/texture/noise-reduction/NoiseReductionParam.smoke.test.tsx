import React from 'react';
import { render } from '@testing-library/react-native';
import { NoiseReductionParam } from './NoiseReductionParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'noise_reduction',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { noiseReductionMode: { value: number }; setNoiseReductionMode: jest.Mock; noiseReductionAuto: { value: boolean } }) => unknown) => {
    const state = {
      noiseReductionMode: { value: 1 },
      setNoiseReductionMode: jest.fn(),
      noiseReductionAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('NoiseReductionParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<NoiseReductionParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
