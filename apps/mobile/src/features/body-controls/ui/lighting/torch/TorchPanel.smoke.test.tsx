/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { TorchPanel } from './TorchPanel';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeDetailPanel: 'none',
      setActiveDetailPanel: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  ParameterControl: 'ParameterControl',
  ParameterPanelWrapper: 'ParameterPanelWrapper',
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

describe('TorchPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<TorchPanel />);
    expect(toJSON()).toBeDefined();
  });
});
