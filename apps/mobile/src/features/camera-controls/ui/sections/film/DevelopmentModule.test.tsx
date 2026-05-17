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
  useUIStore: jest.fn((fn) => fn({
    activeParameter: 'saturation',
    setActiveParameter: jest.fn(),
  })),
}));

jest.mock('../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn) => fn({
    saturation: { value: 1.0 },
    setSaturation: jest.fn(),
    contrast: { value: 1.0 },
    setContrast: jest.fn(),
  })),
}));

jest.mock('../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn) => fn({
    temperature: { value: 5000 },
    setTemperature: jest.fn(),
    temperatureAuto: { value: true },
    setTemperatureAuto: jest.fn(),
  })),
}));

jest.mock('../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

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
    const controls = UNSAFE_getAllByType('ParameterControl' as any);
    const contrastControl = controls.find((c: any) => c.props.label === 'parameters.contrast');
    
    expect(contrastControl).toBeDefined();
    contrastControl.props.onPress();
    expect(mockProps.handlePressWithDouble).toHaveBeenCalledWith('contrast', expect.any(Function));
  });
});
