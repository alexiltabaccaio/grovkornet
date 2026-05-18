import React from 'react';
import { render } from '@testing-library/react-native';
import { FocusParam } from './FocusParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'focus',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { focusDistance: { value: number }; setFocusDistance: jest.Mock; focusAuto: { value: boolean } }) => unknown) => {
    const state = {
      focusDistance: { value: 1 },
      setFocusDistance: jest.fn(),
      focusAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('FocusParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<FocusParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
