import React from 'react';
import { render } from '@testing-library/react-native';
import { ExposureModule } from './ExposureModule';
import { ParameterType } from '@shared/types/camera';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

jest.mock('../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'iso',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { iso: { value: number }; setIso: jest.Mock; isoAuto: { value: boolean }; shutterSpeed: { value: number }; setShutterSpeed: jest.Mock; shutterSpeedAuto: { value: boolean }; ev: { value: number }; setEv: jest.Mock; evAuto: { value: boolean } }) => unknown) => {
    const state = {
      iso: { value: 100 },
      setIso: jest.fn(),
      isoAuto: { value: true },
      shutterSpeed: { value: 60 },
      setShutterSpeed: jest.fn(),
      shutterSpeedAuto: { value: true },
      ev: { value: 0 },
      setEv: jest.fn(),
      evAuto: { value: true },
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('ExposureModule', () => {
  const mockProps = {
    activeParameter: 'iso' as ParameterType,
    setActiveParameter: jest.fn(),
    iso: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setIso: jest.fn(),
    isoAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setIsoAuto: jest.fn(),
    ev: { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setEv: jest.fn(),
    evAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setEvAuto: jest.fn(),
    shutterSpeed: { value: 60 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setShutterSpeed: jest.fn(),
    shutterSpeedAuto: { value: true } as unknown as import('react-native-reanimated').SharedValue<boolean>,
    setShutterSpeedAuto: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ExposureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
