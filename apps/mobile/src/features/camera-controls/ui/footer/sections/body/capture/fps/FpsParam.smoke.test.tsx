import React from 'react';
import { render } from '@testing-library/react-native';
import { FpsParam } from './FpsParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'fps_setting',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { fpsSetting: { value: number }; setFpsSetting: jest.Mock; capabilities: { maxFps: number } }) => unknown) => {
    const state = {
      fpsSetting: { value: 30 },
      setFpsSetting: jest.fn(),
      capabilities: { maxFps: 60 },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('FpsParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<FpsParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
