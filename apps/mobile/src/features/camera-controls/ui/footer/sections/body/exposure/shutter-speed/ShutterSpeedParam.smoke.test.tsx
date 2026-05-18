import React from 'react';
import { render } from '@testing-library/react-native';
import { ShutterSpeedParam } from './ShutterSpeedParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'shutter_speed',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { shutterSpeed: { value: number }; setShutterSpeed: jest.Mock; shutterSpeedAuto: { value: boolean } }) => unknown) => {
    const state = {
      shutterSpeed: { value: 60 },
      setShutterSpeed: jest.fn(),
      shutterSpeedAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('ShutterSpeedParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ShutterSpeedParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
