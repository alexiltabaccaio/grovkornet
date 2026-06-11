import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainSubPanel } from './GrainSubPanel';
import { DEFAULT_GRAIN_SIZE, DEFAULT_GRAIN_SPEED, DEFAULT_GRAIN_ROUGHNESS, DEFAULT_GRAIN_CHROMA } from '@grovkornet/shared';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

const mockSetGrainChroma = jest.fn();
const mockSetGrainSize = jest.fn();
const mockSetGrainSpeed = jest.fn();
const mockSetGrainRoughness = jest.fn();

const mockUpdateGrainChroma = jest.fn();
const mockUpdateGrainSize = jest.fn();
const mockUpdateGrainSpeed = jest.fn();
const mockUpdateGrainRoughness = jest.fn();

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
          props.valueFormatter(2.5);
        }
        if (props.onChange) {
          props.onChange(2.5);
        }
        if (props.onUpdateWorklet) {
          props.onUpdateWorklet(2.5);
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
      grainChroma: { value: 0 },
      setGrainChroma: mockSetGrainChroma,
      grainSize: { value: 2.0 },
      setGrainSize: mockSetGrainSize,
      grainSpeed: { value: 1.0 },
      setGrainSpeed: mockSetGrainSpeed,
      grainRoughness: { value: 0.0 },
      setGrainRoughness: mockSetGrainRoughness,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateGrainChroma: mockUpdateGrainChroma,
    updateGrainSize: mockUpdateGrainSize,
    updateGrainSpeed: mockUpdateGrainSpeed,
    updateGrainRoughness: mockUpdateGrainRoughness,
  }),
}));

describe('GrainDetailPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and executes all control callbacks', () => {
    const { toJSON } = render(<GrainSubPanel />);
    expect(toJSON()).toBeDefined();

    // Verify Chroma updates
    expect(mockSetGrainChroma).toHaveBeenCalledWith(0);
    expect(mockSetGrainChroma).toHaveBeenCalledWith(1);
    expect(mockSetGrainChroma).toHaveBeenCalledWith(DEFAULT_GRAIN_CHROMA);
    expect(mockUpdateGrainChroma).toHaveBeenCalledWith(0);
    expect(mockUpdateGrainChroma).toHaveBeenCalledWith(1);
    expect(mockUpdateGrainChroma).toHaveBeenCalledWith(DEFAULT_GRAIN_CHROMA);

    // Verify Size updates
    expect(mockSetGrainSize).toHaveBeenCalledWith(DEFAULT_GRAIN_SIZE);
    expect(mockUpdateGrainSize).toHaveBeenCalledWith(DEFAULT_GRAIN_SIZE);

    // Verify Speed updates
    expect(mockSetGrainSpeed).toHaveBeenCalledWith(DEFAULT_GRAIN_SPEED);
    expect(mockUpdateGrainSpeed).toHaveBeenCalledWith(DEFAULT_GRAIN_SPEED);

    // Verify Roughness updates
    expect(mockSetGrainRoughness).toHaveBeenCalledWith(DEFAULT_GRAIN_ROUGHNESS);
    expect(mockUpdateGrainRoughness).toHaveBeenCalledWith(DEFAULT_GRAIN_ROUGHNESS);
  });
});
