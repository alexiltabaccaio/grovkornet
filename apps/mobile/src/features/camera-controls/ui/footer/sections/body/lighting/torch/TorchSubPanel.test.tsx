import React from 'react';
import { render } from '@testing-library/react-native';
import { TorchSubPanel } from './TorchSubPanel';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeSubParameter: string; setActiveSubParameter: jest.Mock }) => unknown) => {
    const state = {
      activeSubParameter: 'torch_strength',
      setActiveSubParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { torchStrength: { value: number }; setTorchStrength: jest.Mock }) => unknown) => {
    const state = {
      torchStrength: { value: 0.5 },
      setTorchStrength: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('TorchSubPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<TorchSubPanel animatedStyle={{ opacity: 1 }} />);
    expect(toJSON()).toBeDefined();
  });
});
