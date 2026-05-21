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
jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(() => ({
    activeTab: 'none',
    activeModule: 'none',
    activeParameter: 'none',
    isDebugEnabled: false,
    setActiveTab: jest.fn(),
    setActiveModule: jest.fn(),
    setActiveParameter: jest.fn(),
  })),
}));
jest.mock('@widgets/control-panel', () => ({
  ControlPanel: 'ControlPanel',
}));
jest.mock('@widgets/viewfinder', () => ({
  Viewfinder: 'Viewfinder',
}));
jest.mock('@widgets/header', () => ({
  Header: 'Header',
}));
jest.mock('@features/gallery', () => ({
  CaptureThumbnail: 'CaptureThumbnail',
  VerifiedGallery: 'VerifiedGallery',
}));
jest.mock('@features/body-controls', () => ({
  ShutterButton: 'ShutterButton',
}));
jest.mock('@features/lens-controls', () => ({
  GestureController: 'GestureController',
}));
jest.mock('@features/system-settings', () => ({
  DebugOverlay: 'DebugOverlay',
}));

describe('CameraScreen Component Stability Test', () => {
  it('should render correctly in default state', () => {
    const { toJSON } = render(<CameraScreen />);
    expect(toJSON()).toBeDefined();
  });
});
