import React from 'react';
import { render } from '@testing-library/react-native';
import { IsoParam } from './IsoParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'iso',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { iso: { value: number }; setIso: jest.Mock; isoAuto: { value: boolean } }) => unknown) => {
    const state = {
      iso: { value: 100 },
      setIso: jest.fn(),
      isoAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('IsoParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<IsoParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
