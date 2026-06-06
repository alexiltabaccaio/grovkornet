import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugPanel } from './DebugPanel';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { 
    isDebugEnabled: boolean; 
    setIsDebugEnabled: jest.Mock;
    isLogsEnabled: boolean;
    setIsLogsEnabled: jest.Mock;
    isCameraSecure: boolean;
    setIsCameraSecure: jest.Mock;
    thermalState: 'normal' | 'warning' | 'critical';
    setThermalState: jest.Mock;
  }) => unknown) => {
    const state = {
      isDebugEnabled: false,
      setIsDebugEnabled: jest.fn(),
      isLogsEnabled: false,
      setIsLogsEnabled: jest.fn(),
      isCameraSecure: false,
      setIsCameraSecure: jest.fn(),
      thermalState: 'normal' as const,
      setThermalState: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  ParameterPanelWrapper: 'ParameterPanelWrapper',
}));

describe('DebugPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<DebugPanel />);
    expect(toJSON()).toBeDefined();
  });
});
