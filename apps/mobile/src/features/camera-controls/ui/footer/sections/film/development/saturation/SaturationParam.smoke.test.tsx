import React from 'react';
import { render } from '@testing-library/react-native';
import { SaturationParam } from './SaturationParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'saturation',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { saturation: { value: number }; setSaturation: jest.Mock }) => unknown) => {
    const state = {
      saturation: { value: 1.2 },
      setSaturation: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('SaturationParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<SaturationParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
