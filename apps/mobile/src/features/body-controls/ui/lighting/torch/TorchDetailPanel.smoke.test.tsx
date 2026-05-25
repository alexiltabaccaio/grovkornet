import React from 'react';
import { render } from '@testing-library/react-native';
import { TorchDetailPanel } from './TorchDetailPanel';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeDetailPanel: 'none',
      setActiveDetailPanel: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
  ParameterDetailPanelWrapper: 'ParameterDetailPanelWrapper',
}));

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      torchState: { value: 0 },
      setTorchState: jest.fn(),
      torchStrength: { value: 0.5 },
      setTorchStrength: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useBodyWorklets: jest.fn(() => ({
    updateTorchStrength: jest.fn(),
  })),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    ScrollView: 'View',
    TouchableOpacity: View,
  };
});

describe('TorchDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<TorchDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
