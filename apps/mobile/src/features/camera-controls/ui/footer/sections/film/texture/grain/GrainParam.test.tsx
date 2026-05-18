import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainParam } from './GrainParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'grain',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { grainIntensity: { value: number }; setGrainIntensity: jest.Mock }) => unknown) => {
    const state = {
      grainIntensity: { value: 0.5 },
      setGrainIntensity: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('GrainParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<GrainParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
