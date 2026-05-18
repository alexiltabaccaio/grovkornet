import React from 'react';
import { render } from '@testing-library/react-native';
import { SharpeningParam } from './SharpeningParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'sharpening',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { sharpening: { value: number }; setSharpening: jest.Mock }) => unknown) => {
    const state = {
      sharpening: { value: 0.5 },
      setSharpening: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('SharpeningParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<SharpeningParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
