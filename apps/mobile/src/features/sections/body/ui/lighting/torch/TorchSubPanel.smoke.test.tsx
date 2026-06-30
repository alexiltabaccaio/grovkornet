/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { TorchSubPanel } from './TorchSubPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetActiveDetailPanel = jest.fn();
const mockSetTorchStrength = jest.fn();
const mockUpdateTorchStrength = jest.fn();

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSystemStore: (fn: (state: any) => any) => {
      const state = {
        isLayoutOverlayEnabled: false,
      };
      return typeof fn === 'function' ? fn(state) : state;
    },
    useControlPanelStore: (fn: (state: any) => any) => {
      const state = {
        activeDetailPanel: 'torch_strength',
        setActiveDetailPanel: mockSetActiveDetailPanel,
      };
      return typeof fn === 'function' ? fn(state) : state;
    },
    ParameterControl: ({ valueFormatter }: any) => {
      React.useEffect(() => {
        if (valueFormatter) {
          valueFormatter(0.5);
        }
      }, [valueFormatter]);
      return <View testID="ParameterControl" />;
    },
  };
});

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      torchStrength: 0.5,
      setTorchStrength: mockSetTorchStrength,
    };
    return fn(state);
  },
  useBodyWorklets: () => ({
    updateTorchStrength: mockUpdateTorchStrength,
  }),
}));

describe('TorchSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON, getByTestId } = render(<TorchSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByTestId('ParameterControl')).toBeDefined();
  });
});
