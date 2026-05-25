/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/exhaustive-deps */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SaturationDetailPanel } from './SaturationDetailPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

const mockSetters = {
  setSatRed: jest.fn(),
  setSatOrange: jest.fn(),
  setSatYellow: jest.fn(),
  setSatGreen: jest.fn(),
  setSatCyan: jest.fn(),
  setSatBlue: jest.fn(),
  setSatPurple: jest.fn(),
  setSatMagenta: jest.fn(),
};

const mockWorklets = {
  updateSatRed: jest.fn(),
  updateSatOrange: jest.fn(),
  updateSatYellow: jest.fn(),
  updateSatGreen: jest.fn(),
  updateSatCyan: jest.fn(),
  updateSatBlue: jest.fn(),
  updateSatPurple: jest.fn(),
  updateSatMagenta: jest.fn(),
};

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ParameterControl: (props: any) => {
      // Trigger onChange to test state updates
      React.useEffect(() => {
        if (props.onChange) {
          props.onChange(85);
        }
        if (props.valueFormatter) {
          props.valueFormatter(50);
        }
      }, [props.onChange, props.valueFormatter]);
      return <View testID="ParameterControl" />;
    },
  };
});

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      satRed: 50.0,
      setSatRed: mockSetters.setSatRed,
      satOrange: 50.0,
      setSatOrange: mockSetters.setSatOrange,
      satYellow: 50.0,
      setSatYellow: mockSetters.setSatYellow,
      satGreen: 50.0,
      setSatGreen: mockSetters.setSatGreen,
      satCyan: 50.0,
      setSatCyan: mockSetters.setSatCyan,
      satBlue: 50.0,
      setSatBlue: mockSetters.setSatBlue,
      satPurple: 50.0,
      setSatPurple: mockSetters.setSatPurple,
      satMagenta: 50.0,
      setSatMagenta: mockSetters.setSatMagenta,
      boundMagentaRed: { value: 350.0 },
      boundRedOrange: { value: 45.0 },
      boundOrangeYellow: { value: 80.0 },
      boundYellowGreen: { value: 125.0 },
      boundGreenCyan: { value: 170.0 },
      boundCyanBlue: { value: 230.0 },
      boundBluePurple: { value: 280.0 },
      boundPurpleMagenta: { value: 315.0 },
      setBoundMagentaRed: jest.fn(),
      setBoundRedOrange: jest.fn(),
      setBoundOrangeYellow: jest.fn(),
      setBoundYellowGreen: jest.fn(),
      setBoundGreenCyan: jest.fn(),
      setBoundCyanBlue: jest.fn(),
      setBoundBluePurple: jest.fn(),
      setBoundPurpleMagenta: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => mockWorklets,
  useFilmParameterControlData: () => ({
    value: 1.0,
    minValue: 0.0,
    maxValue: 2.0,
    centerValue: 1.0,
    onChange: jest.fn(),
    onUpdateWorklet: jest.fn(),
    valueFormatter: (v: number) => v.toString(),
  }),
}));

describe('SaturationDetailPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON } = render(<SaturationDetailPanel />);
    expect(toJSON()).toBeDefined();
  });

  it('handles switching between all color channels and updates state', () => {
    const { getByTestId } = render(<SaturationDetailPanel />);

    const colors = [
      { key: 'red', setter: mockSetters.setSatRed },
      { key: 'orange', setter: mockSetters.setSatOrange },
      { key: 'yellow', setter: mockSetters.setSatYellow },
      { key: 'green', setter: mockSetters.setSatGreen },
      { key: 'cyan', setter: mockSetters.setSatCyan },
      { key: 'blue', setter: mockSetters.setSatBlue },
      { key: 'purple', setter: mockSetters.setSatPurple },
      { key: 'magenta', setter: mockSetters.setSatMagenta },
    ];

    colors.forEach(({ key, setter }) => {
      const btn = getByTestId(`color-circle-${key}`);
      fireEvent.press(btn);

      // ParameterControl mock will trigger onChange, check if corresponding setter was called
      expect(setter).toHaveBeenCalledWith(85);
    });
  });
});
