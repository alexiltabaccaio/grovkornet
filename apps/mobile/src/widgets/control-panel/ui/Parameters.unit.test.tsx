/* eslint-disable @typescript-eslint/no-require-imports */
import { render, act } from '@testing-library/react-native';
import { Parameters } from './Parameters';
import { useSystemStore } from '@entities/system';

jest.mock('@features/film-controls', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return { 
    TextureModule: () => <TextMock>TextureModule</TextMock>,
    DevelopmentModule: () => <TextMock>DevelopmentModule</TextMock>,
  };
});
jest.mock('@features/lens-controls', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return {
    FlawsModule: () => <TextMock>FlawsModule</TextMock>,
    OpticsModule: () => <TextMock>OpticsModule</TextMock>,
  };
});
jest.mock('@features/body-controls', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return {
    ExposureModule: () => <TextMock>ExposureModule</TextMock>,
    LightingModule: () => <TextMock>LightingModule</TextMock>,
    CaptureModule: () => <TextMock>CaptureModule</TextMock>,
  };
});
jest.mock('@features/system-settings', () => {
  const { Text: TextMock } = require('react-native') as typeof import('react-native');
  return {
    PreferencesModule: () => <TextMock>PreferencesModule</TextMock>,
  };
});

describe('Parameters', () => {
  it('renders nothing inside if activeModule is none', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('none');
    });
    const { toJSON } = render(<Parameters />);
    expect((toJSON() as { children?: unknown } | null)?.children).toBeNull();
  });

  it('renders TextureModule when activeModule is texture', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('texture');
    });
    const { getByText } = render(<Parameters />);
    expect(getByText('TextureModule')).toBeDefined();
  });

  it('renders ExposureModule when activeModule is exposure', () => {
    act(() => {
      useSystemStore.getState().setActiveModule('exposure');
    });
    const { getByText } = render(<Parameters />);
    expect(getByText('ExposureModule')).toBeDefined();
  });
});
