import React from 'react';
import { render } from '@testing-library/react-native';
import { NoiseReductionExtension } from './NoiseReductionExtension';

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { noiseReductionMode: { value: number }; setNoiseReductionMode: jest.Mock; noiseReductionAuto: { value: boolean }; setNoiseReductionAuto: jest.Mock }) => unknown) => {
    const state = {
      noiseReductionMode: { value: 1 },
      setNoiseReductionMode: jest.fn(),
      noiseReductionAuto: { value: true },
      setNoiseReductionAuto: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('NoiseReductionExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<NoiseReductionExtension />);
    expect(toJSON()).toBeDefined();
  });
});
