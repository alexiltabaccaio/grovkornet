/* eslint-disable @typescript-eslint/no-require-imports */
import { render, act } from '@testing-library/react-native';
import { FooterParameters } from './FooterParameters';
import { useUIStore } from '../model/useUIStore';

// Mock the individual modules to simplify testing FooterParameters
jest.mock('./sections/film/TextureModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { TextureModule: () => <TextMock>TextureModule</TextMock> };
});
jest.mock('./sections/film/DevelopmentModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { DevelopmentModule: () => <TextMock>DevelopmentModule</TextMock> };
});
jest.mock('./sections/lens/FlawsModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { FlawsModule: () => <TextMock>FlawsModule</TextMock> };
});
jest.mock('./sections/body/ExposureModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { ExposureModule: () => <TextMock>ExposureModule</TextMock> };
});
jest.mock('./sections/system/PreferencesModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { PreferencesModule: () => <TextMock>PreferencesModule</TextMock> };
});

jest.mock('./sections/lens/OpticsModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { OpticsModule: () => <TextMock>OpticsModule</TextMock> };
});
jest.mock('./sections/body/LightingModule', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { LightingModule: () => <TextMock>LightingModule</TextMock> };
});

describe('FooterParameters', () => {
  it('renders nothing inside if activeModule is none', () => {
    act(() => {
      useUIStore.getState().setActiveModule('none');
    });
    const { toJSON } = render(<FooterParameters />);
    expect((toJSON() as { children?: unknown } | null)?.children).toBeNull();
  });

  it('renders TextureModule when activeModule is texture', () => {
    act(() => {
      useUIStore.getState().setActiveModule('texture');
    });
    const { getByText } = render(<FooterParameters />);
    expect(getByText('TextureModule')).toBeDefined();
  });

  it('renders ExposureModule when activeModule is exposure', () => {
    act(() => {
      useUIStore.getState().setActiveModule('exposure');
    });
    const { getByText } = render(<FooterParameters />);
    expect(getByText('ExposureModule')).toBeDefined();
  });
});
