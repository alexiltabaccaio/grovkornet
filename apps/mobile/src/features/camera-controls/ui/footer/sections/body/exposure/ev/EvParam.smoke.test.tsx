import React from 'react';
import { render } from '@testing-library/react-native';
import { EvParam } from './EvParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'ev',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { ev: { value: number }; setEv: jest.Mock; evAuto: { value: boolean }; isoAuto: { value: boolean }; shutterSpeedAuto: { value: boolean } }) => unknown) => {
    const state = {
      ev: { value: 0 },
      setEv: jest.fn(),
      evAuto: { value: true },
      isoAuto: { value: true },
      shutterSpeedAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('EvParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<EvParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
