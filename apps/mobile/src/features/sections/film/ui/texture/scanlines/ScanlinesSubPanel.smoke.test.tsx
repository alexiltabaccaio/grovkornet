 
import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanlinesSubPanel } from './ScanlinesSubPanel';
import { DEFAULT_SCANLINES_MODE, DEFAULT_SCANLINES_DENSITY } from '@grovkornet/shared';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

const mockSetScanlinesMode = jest.fn();
const mockSetScanlinesDensity = jest.fn();

const mockUpdateScanlinesMode = jest.fn();
const mockUpdateScanlinesDensity = jest.fn();

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSystemStore: jest.fn((fn?: (state: { isLayoutOverlayEnabled: boolean }) => unknown) => {
      const state = {
        isLayoutOverlayEnabled: true, // test with true to cover overlay styles
      };
      return fn ? fn(state) : state;
    }),
    ParameterControl: (props: any) => {
      React.useEffect(() => {
        if (props.valueFormatter) {
          props.valueFormatter(500);
        }
        if (props.onChange) {
          props.onChange(500);
        }
        if (props.onUpdateWorklet) {
          props.onUpdateWorklet(500);
        }
        if (props.onReset) {
          props.onReset();
        }
      }, [props]);
      return <View testID="ParameterControl" />;
    },
    ParameterDetailPanelWrapper: 'ParameterDetailPanelWrapper',
  };
});

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PillButton: (props: any) => {
      React.useEffect(() => {
        if (props.onPress) {
          props.onPress();
        }
      }, [props]);
      return <View testID="PillButton" />;
    },
    ResettableLabel: (props: any) => {
      React.useEffect(() => {
        if (props.onReset) {
          props.onReset();
        }
      }, [props]);
      return <View testID="ResettableLabel" />;
    },
    SubPanelContainer: ({ children }: any) => children,
  };
});

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      scanlinesMode: { value: 0 },
      setScanlinesMode: mockSetScanlinesMode,
      scanlinesDensity: { value: 800.0 },
      setScanlinesDensity: mockSetScanlinesDensity,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateScanlinesMode: mockUpdateScanlinesMode,
    updateScanlinesDensity: mockUpdateScanlinesDensity,
  }),
}));

describe('ScanlinesSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and executes all control callbacks', () => {
    const { toJSON } = render(<ScanlinesSubPanel />);
    expect(toJSON()).toBeDefined();

    // Verify Direction/Mode updates
    expect(mockSetScanlinesMode).toHaveBeenCalledWith(0);
    expect(mockSetScanlinesMode).toHaveBeenCalledWith(1);
    expect(mockSetScanlinesMode).toHaveBeenCalledWith(DEFAULT_SCANLINES_MODE);
    expect(mockUpdateScanlinesMode).toHaveBeenCalledWith(0);
    expect(mockUpdateScanlinesMode).toHaveBeenCalledWith(1);
    expect(mockUpdateScanlinesMode).toHaveBeenCalledWith(DEFAULT_SCANLINES_MODE);

    // Verify Density updates
    expect(mockSetScanlinesDensity).toHaveBeenCalledWith(DEFAULT_SCANLINES_DENSITY);
    expect(mockUpdateScanlinesDensity).toHaveBeenCalledWith(DEFAULT_SCANLINES_DENSITY);
  });
});
