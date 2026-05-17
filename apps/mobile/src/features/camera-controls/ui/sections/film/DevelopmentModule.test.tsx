import React from 'react';
import { render } from '@testing-library/react-native';
import { DevelopmentModule } from './DevelopmentModule';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

// Reanimated is mocked in jest.setup.ts

jest.mock('../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'saturation',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { saturation: { value: number }; setSaturation: jest.Mock; contrast: { value: number }; setContrast: jest.Mock }) => unknown) => {
    const state = {
      saturation: { value: 1.0 },
      setSaturation: jest.fn(),
      contrast: { value: 1.0 },
      setContrast: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { temperature: { value: number }; setTemperature: jest.Mock; temperatureAuto: { value: boolean }; setTemperatureAuto: jest.Mock }) => unknown) => {
    const state = {
      temperature: { value: 5000 },
      setTemperature: jest.fn(),
      temperatureAuto: { value: true },
      setTemperatureAuto: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

interface MockControlInstance {
  props: {
    label: string;
    onPress: () => void;
  };
}

describe('DevelopmentModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<DevelopmentModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('passes handlePressWithDouble to Contrast control', () => {
    const { UNSAFE_getAllByType } = render(<DevelopmentModule {...mockProps} />);
    const controls = UNSAFE_getAllByType('ParameterControl' as unknown as React.ComponentType);
    const contrastControl = controls.find((c) => (c as unknown as MockControlInstance).props.label === 'parameters.contrast') as unknown as MockControlInstance | undefined;
    
    expect(contrastControl).toBeDefined();
    contrastControl!.props.onPress();
    expect(mockProps.handlePressWithDouble).toHaveBeenCalledWith('contrast', expect.any(Function));
  });
});
