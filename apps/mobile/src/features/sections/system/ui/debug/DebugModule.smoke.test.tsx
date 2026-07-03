import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugModule } from './DebugModule';
import { UiOverlayPanel } from './UiOverlayPanel';
import { TemperatureTestPanel } from './TemperatureTestPanel';
import { DeveloperOptionsPanel } from './DeveloperOptionsPanel';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeParameter: 'ui_overlay',
      setActiveParameter: jest.fn(),
      isFpsOverlayEnabled: false,
      setIsFpsOverlayEnabled: jest.fn(),
      isLayoutOverlayEnabled: false,
      setIsLayoutOverlayEnabled: jest.fn(),
      thermalState: 'normal',
      setThermalState: jest.fn(),
      isLogsEnabled: false,
      setIsLogsEnabled: jest.fn(),

    };
    return fn ? fn(state) : state;
  }),
  useControlPanelStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeParameter: 'ui_overlay',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  ConnectedParameter: () => null,
  ParameterPanelWrapper: ({ children }: any) => children,
}));


jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


describe('Debug module panels', () => {
  it('renders DebugModule correctly', () => {
    const { toJSON } = render(<DebugModule />);
    expect(toJSON()).toBeDefined();
  });

  it('renders UiOverlayPanel correctly', () => {
    const { getByText } = render(<UiOverlayPanel />);
    expect(getByText('FPS')).toBeDefined();
    expect(getByText('LAYOUT')).toBeDefined();
  });

  it('renders TemperatureTestPanel correctly', () => {
    const { getByText } = render(<TemperatureTestPanel />);
    expect(getByText('NORMAL')).toBeDefined();
    expect(getByText('WARNING')).toBeDefined();
    expect(getByText('CRITICAL')).toBeDefined();
  });

  it('renders DeveloperOptionsPanel correctly', () => {
    const { getByText } = render(<DeveloperOptionsPanel />);
    expect(getByText('LOGS')).toBeDefined();

  });
});
