import React from 'react';
import { render } from '@testing-library/react-native';
import { TemperatureParam } from './TemperatureParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'temperature',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { temperature: { value: number }; setTemperature: jest.Mock; temperatureAuto: { value: boolean } }) => unknown) => {
    const state = {
      temperature: { value: 5000 },
      setTemperature: jest.fn(),
      temperatureAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('TemperatureParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<TemperatureParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
