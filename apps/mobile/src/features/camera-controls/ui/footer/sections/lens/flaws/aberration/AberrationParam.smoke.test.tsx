import React from 'react';
import { render } from '@testing-library/react-native';
import { AberrationParam } from './AberrationParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'chromatic_aberration',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { chromaticAberration: { value: number }; setChromaticAberration: jest.Mock }) => unknown) => {
    const state = {
      chromaticAberration: { value: 0.5 },
      setChromaticAberration: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('AberrationParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<AberrationParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
