import React from 'react';
import { render } from '@testing-library/react-native';
import { CameraScreen } from './CameraScreen';

// Complex mocks for native components and hooks
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));
jest.mock('@features/camera-controls', () => ({
  useUIStore: jest.fn(() => ({
    activeTab: 'none',
    activeModule: 'none',
    activeParameter: 'none',
    isDebugEnabled: false,
    setActiveTab: jest.fn(),
    setActiveModule: jest.fn(),
    setActiveParameter: jest.fn(),
  })),
  GestureController: 'GestureController',
  Footer: 'Footer',
  DebugOverlay: 'DebugOverlay',
  ConnectedFilmCamera: 'ConnectedFilmCamera',
  ShutterButton: 'ShutterButton',
}));

describe('CameraScreen Component Stability Test', () => {
  it('should render correctly in default state', () => {
    const { toJSON } = render(<CameraScreen />);
    expect(toJSON()).toBeDefined();
  });
});
