import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugExtension } from './DebugExtension';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { 
    isDebugEnabled: boolean; 
    setIsDebugEnabled: jest.Mock;
    isLogsEnabled: boolean;
    setIsLogsEnabled: jest.Mock;
  }) => unknown) => {
    const state = {
      isDebugEnabled: false,
      setIsDebugEnabled: jest.fn(),
      isLogsEnabled: false,
      setIsLogsEnabled: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../components/ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('DebugExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<DebugExtension />);
    expect(toJSON()).toBeDefined();
  });
});
