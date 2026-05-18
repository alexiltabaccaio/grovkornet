import React from 'react';
import { render } from '@testing-library/react-native';
import { ResolutionParam } from './ResolutionParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'resolution_setting',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { resolutionSetting: { value: number }; setResolutionSetting: jest.Mock }) => unknown) => {
    const state = {
      resolutionSetting: { value: 1 },
      setResolutionSetting: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('ResolutionParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ResolutionParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
