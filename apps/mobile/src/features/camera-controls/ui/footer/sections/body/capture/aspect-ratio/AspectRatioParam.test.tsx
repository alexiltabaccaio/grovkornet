import React from 'react';
import { render } from '@testing-library/react-native';
import { AspectRatioParam } from './AspectRatioParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'aspect_ratio',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { aspectRatio: { value: number }; setAspectRatio: jest.Mock }) => unknown) => {
    const state = {
      aspectRatio: { value: 0 },
      setAspectRatio: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('AspectRatioParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<AspectRatioParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
