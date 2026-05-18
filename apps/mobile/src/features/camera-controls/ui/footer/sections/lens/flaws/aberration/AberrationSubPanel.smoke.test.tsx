import React from 'react';
import { render } from '@testing-library/react-native';
import { AberrationSubPanel } from './AberrationSubPanel';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeSubParameter: string; setActiveSubParameter: jest.Mock }) => unknown) => {
    const state = {
      activeSubParameter: 'aberration_direction',
      setActiveSubParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { aberrationDirection: { value: number }; setAberrationDirection: jest.Mock }) => unknown) => {
    const state = {
      aberrationDirection: { value: 0 },
      setAberrationDirection: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('AberrationSubPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AberrationSubPanel animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
  });
});
