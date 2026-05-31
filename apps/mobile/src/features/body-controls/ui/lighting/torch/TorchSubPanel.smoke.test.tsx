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
        activeDetailPanel: 'torch_strength',
        setActiveDetailPanel: mockSetActiveDetailPanel,
      };
      return fn(state);
    },
    ParameterControl: (props: any) => {
      React.useEffect(() => {
        if (props.valueFormatter) {
          props.valueFormatter(0.5);
        }
      }, [props.valueFormatter]);
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
