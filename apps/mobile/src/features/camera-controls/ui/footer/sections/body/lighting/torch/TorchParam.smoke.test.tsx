import React from 'react';
import { render } from '@testing-library/react-native';
import { TorchParam } from './TorchParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'torch',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { capabilities: { hasTorch: boolean }; torchState: { value: number }; setTorchState: jest.Mock }) => unknown) => {
    const state = {
      capabilities: { hasTorch: true },
      torchState: { value: 0 },
      setTorchState: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('TorchParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<TorchParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
