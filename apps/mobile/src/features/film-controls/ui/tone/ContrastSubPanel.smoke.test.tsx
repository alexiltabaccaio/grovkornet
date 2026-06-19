/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ContrastSubPanel } from './ContrastSubPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetPivot = jest.fn();
const mockSetPivotAuto = jest.fn();
const mockUpdatePivot = jest.fn();

jest.mock('@entities/film', () => ({
  useFilmStore: (fn: (state: any) => any) => {
    const state = {
      pivot: 0.5,
      setPivot: mockSetPivot,
      pivotAuto: true,
      setPivotAuto: mockSetPivotAuto,
    };
    return fn(state);
  },
  useFilmWorklets: () => ({
    updatePivot: mockUpdatePivot,
  }),
}));

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
      const state = {
        isLayoutOverlayEnabled: false,
      };
      return fn ? fn(state) : state;
    }),
    ParameterControl: (props: any) => {
      React.useEffect(() => {
        if (props.valueFormatter) {
          // Trigger both positive and negative formatting paths
          props.valueFormatter(0.7);
          props.valueFormatter(0.3);
        }
        if (props.onReset) {
          props.onReset();
        }
        if (props.onChange) {
          props.onChange(0.6);
        }
        if (props.onUpdateWorklet) {
          props.onUpdateWorklet(0.6);
        }
      }, [props]);
      return <View testID="ParameterControl" />;
    },
  };
});

describe('ContrastSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and executes callbacks including resets', () => {
    const { toJSON, getByTestId } = render(<ContrastSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByTestId('ParameterControl')).toBeDefined();

    // Verify pivot updates
    expect(mockSetPivotAuto).toHaveBeenCalledWith(true);
    expect(mockSetPivot).toHaveBeenCalledWith(0.6);
    expect(mockUpdatePivot).toHaveBeenCalledWith(0.6);
  });
});
