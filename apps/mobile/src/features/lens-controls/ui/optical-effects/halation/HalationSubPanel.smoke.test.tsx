import React from 'react';
import { render } from '@testing-library/react-native';
import { HalationSubPanel } from './HalationSubPanel';

const mockSetHalationThreshold = jest.fn();
const mockUpdateHalationThreshold = jest.fn();
let mockIsLayoutOverlayEnabled = false;
let mockHalationThresholdVal = 0.5;

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
      halationThreshold: { value: mockHalationThresholdVal },
      setHalationThreshold: mockSetHalationThreshold,
    };
    return fn ? fn(state) : state;
  }),
  useFilmWorklets: () => ({
    updateHalationThreshold: mockUpdateHalationThreshold,
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

describe('HalationSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLayoutOverlayEnabled = false;
    mockHalationThresholdVal = 0.5;
  });

  it('renders correctly', () => {
    const { toJSON } = render(<HalationSubPanel />);
    expect(toJSON()).toBeDefined();
  });
});
