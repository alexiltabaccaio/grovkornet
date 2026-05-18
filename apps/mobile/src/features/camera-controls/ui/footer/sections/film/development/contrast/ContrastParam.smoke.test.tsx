import React from 'react';
import { render } from '@testing-library/react-native';
import { ContrastParam } from './ContrastParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'contrast',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { contrast: { value: number }; setContrast: jest.Mock }) => unknown) => {
    const state = {
      contrast: { value: 1.2 },
      setContrast: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('ContrastParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ContrastParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
