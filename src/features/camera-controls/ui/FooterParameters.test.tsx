/* eslint-disable @typescript-eslint/no-require-imports */
import { render, act } from '@testing-library/react-native';
import { FooterParameters } from './FooterParameters';
import { useUIStore } from '../model/useUIStore';

// Mock the individual modules to simplify testing FooterParameters
jest.mock('./modules/GrainModule', () => {
  const { Text: TextMock } = require('react-native');
  return { GrainModule: () => <TextMock>GrainModule</TextMock> };
});
jest.mock('./modules/ColorGradingModule', () => {
  const { Text: TextMock } = require('react-native');
  return { ColorGradingModule: () => <TextMock>ColorGradingModule</TextMock> };
});
jest.mock('./modules/LensEffectsModule', () => {
  const { Text: TextMock } = require('react-native');
  return { LensEffectsModule: () => <TextMock>LensEffectsModule</TextMock> };
});
jest.mock('./modules/ManualExposureModule', () => {
  const { Text: TextMock } = require('react-native');
  return { ManualExposureModule: () => <TextMock>ManualExposureModule</TextMock> };
});
jest.mock('./modules/LanguageModule', () => {
  const { Text: TextMock } = require('react-native');
  return { LanguageModule: () => <TextMock>LanguageModule</TextMock> };
});
jest.mock('./modules/DebugModule', () => {
  const { Text: TextMock } = require('react-native');
  return { DebugModule: () => <TextMock>DebugModule</TextMock> };
});

describe('FooterParameters', () => {
  it('renders nothing inside if activeModule is none', () => {
    act(() => {
      useUIStore.getState().setActiveModule('none');
    });
    const { toJSON } = render(<FooterParameters />);
    expect(toJSON()?.children).toBeNull();
  });

  it('renders GrainModule when activeModule is grain', () => {
    act(() => {
      useUIStore.getState().setActiveModule('grain');
    });
    const { getByText } = render(<FooterParameters />);
    expect(getByText('GrainModule')).toBeDefined();
  });

  it('renders ManualExposureModule when activeModule is manual_exposure', () => {
    act(() => {
      useUIStore.getState().setActiveModule('manual_exposure');
    });
    const { getByText } = render(<FooterParameters />);
    expect(getByText('ManualExposureModule')).toBeDefined();
  });
});
