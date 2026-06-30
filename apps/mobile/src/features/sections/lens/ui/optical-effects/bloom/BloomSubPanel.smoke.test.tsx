import React from 'react';
import { render } from '@testing-library/react-native';
import { BloomSubPanel } from './BloomSubPanel';

const mockSetBloomThreshold = jest.fn();
const mockUpdateBloomThreshold = jest.fn();
let mockIsLayoutOverlayEnabled = false;
let mockBloomThresholdVal = 0.5;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      bloomThreshold: { value: mockBloomThresholdVal },
      setBloomThreshold: mockSetBloomThreshold,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateBloomThreshold: mockUpdateBloomThreshold,
  }),
}));

jest.mock('@entities/system', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSystemStore: jest.fn((fn?: (state: { isLayoutOverlayEnabled: boolean }) => unknown) => {
      const state = { isLayoutOverlayEnabled: mockIsLayoutOverlayEnabled };
      return fn ? fn(state) : state;
    }),
    ParameterControl: (props: any) => {
      React.useEffect(() => {
        if (props.onChange) {
          props.onChange(0.5);
        }
        if (props.onUpdateWorklet) {
          props.onUpdateWorklet(0.5);
        }
        if (props.onReset) {
          props.onReset();
        }
      }, [props]);
      return <View testID="ParameterControl" />;
    },
  };
});

describe('BloomSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLayoutOverlayEnabled = false;
    mockBloomThresholdVal = 0.5;
  });

  it('renders correctly', () => {
    const { toJSON } = render(<BloomSubPanel />);
    expect(toJSON()).toBeDefined();
  });
});
