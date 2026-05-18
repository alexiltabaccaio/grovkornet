import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainSubPanel } from './GrainSubPanel';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeSubParameter: string; setActiveSubParameter: jest.Mock }) => unknown) => {
    const state = {
      activeSubParameter: 'grain_chroma',
      setActiveSubParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { grainChroma: { value: number }; setGrainChroma: jest.Mock; grainSize: { value: number }; setGrainSize: jest.Mock }) => unknown) => {
    const state = {
      grainChroma: { value: 1 },
      setGrainChroma: jest.fn(),
      grainSize: { value: 1 },
      setGrainSize: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('GrainSubPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GrainSubPanel animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
  });
});
