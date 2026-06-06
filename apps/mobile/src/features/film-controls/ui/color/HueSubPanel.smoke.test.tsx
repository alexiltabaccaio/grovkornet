/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/exhaustive-deps */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HueSubPanel } from './HueSubPanel';

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
  setHueRed: jest.fn(),
  setHueOrange: jest.fn(),
  setHueYellow: jest.fn(),
  setHueGreen: jest.fn(),
  setHueCyan: jest.fn(),
  setHueBlue: jest.fn(),
  setHuePurple: jest.fn(),
  setHueMagenta: jest.fn(),
};

const mockWorklets = {
  updateHueRed: jest.fn(),
  updateHueOrange: jest.fn(),
  updateHueYellow: jest.fn(),
  updateHueGreen: jest.fn(),
  updateHueCyan: jest.fn(),
  updateHueBlue: jest.fn(),
  updateHuePurple: jest.fn(),
  updateHueMagenta: jest.fn(),
};

const mockMasterData = {
  value: 0.0,
  minValue: -180.0,
  maxValue: 180.0,
  centerValue: 0.0,
  onChange: jest.fn(),
  onUpdateWorklet: jest.fn(),
  onReset: jest.fn(),
  hideValueInAuto: false,
  autoValueText: 'AUTO',
  valueFormatter: (v: number) => v.toString(),
};

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
      const state = {
        activeParameter: 'hue',
        activeDetailPanel: 'master',
        setActiveDetailPanel: jest.fn(),
      };
      return fn ? fn(state) : state;
    }),
    ParameterControl: (props: any) => {
      React.useEffect(() => {
        if (props.onChange) {
          props.onChange(45);
        }
        if (props.valueFormatter) {
          props.valueFormatter(45);
        }
      }, [props.onChange, props.valueFormatter]);
      return <View testID="ParameterControl" />;
    },
  };
});

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      hueRed: 0.0,
      setHueRed: mockSetters.setHueRed,
      hueOrange: 0.0,
      setHueOrange: mockSetters.setHueOrange,
      hueYellow: 0.0,
      setHueYellow: mockSetters.setHueYellow,
      hueGreen: 0.0,
      setHueGreen: mockSetters.setHueGreen,
      hueCyan: 0.0,
      setHueCyan: mockSetters.setHueCyan,
      hueBlue: 0.0,
      setHueBlue: mockSetters.setHueBlue,
      huePurple: 0.0,
      setHuePurple: mockSetters.setHuePurple,
      hueMagenta: 0.0,
      setHueMagenta: mockSetters.setHueMagenta,
      boundMagentaRed: { value: 350.0 },
      boundRedOrange: { value: 40.0 },
      boundOrangeYellow: { value: 70.0 },
      boundYellowGreen: { value: 110.0 },
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
  useFilmParameterControlData: () => mockMasterData,
}));

describe('HueSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON } = render(<HueSubPanel />);
    expect(toJSON()).toBeDefined();
  });

  it('handles switching between all color channels and updates state', () => {
    const { getByTestId } = render(<HueSubPanel />);

    const colors = [
      { key: 'red', setter: mockSetters.setHueRed },
      { key: 'orange', setter: mockSetters.setHueOrange },
      { key: 'yellow', setter: mockSetters.setHueYellow },
      { key: 'green', setter: mockSetters.setHueGreen },
      { key: 'cyan', setter: mockSetters.setHueCyan },
      { key: 'blue', setter: mockSetters.setHueBlue },
      { key: 'purple', setter: mockSetters.setHuePurple },
      { key: 'magenta', setter: mockSetters.setHueMagenta },
    ];

    colors.forEach(({ key, setter }) => {
      const btn = getByTestId(`color-circle-${key}`);
      fireEvent.press(btn);
      expect(setter).toHaveBeenCalledWith(45);
    });
  });
});
