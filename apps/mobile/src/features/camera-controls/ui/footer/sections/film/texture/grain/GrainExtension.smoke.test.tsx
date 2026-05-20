import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainExtension } from './GrainExtension';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('@features/camera-controls/ui/footer/components/ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

jest.mock('@features/camera-controls/model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = {
      isDebugEnabled: false,
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('@features/camera-controls/model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { grainChroma: { value: number }; setGrainChroma: jest.Mock; grainSize: { value: number }; setGrainSize: jest.Mock }) => unknown) => {
    const state = {
      grainChroma: { value: 0 },
      setGrainChroma: jest.fn(),
      grainSize: { value: 2.0 },
      setGrainSize: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('@features/camera-controls/lib/useCameraWorklets', () => ({
  useCameraWorklets: () => ({
    updateGrainChroma: jest.fn(),
    updateGrainSize: jest.fn(),
  }),
}));

describe('GrainExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GrainExtension />);
    expect(toJSON()).toBeDefined();
  });
});
