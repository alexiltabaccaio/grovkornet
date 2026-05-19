import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';

import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { useStylesStore } from '@features/camera-controls/model/useStylesStore';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { SectionType, ModuleType, ParameterType } from '@shared/types/camera';

// Mocks for icons (which often cause issues in node tests)
// Reanimated is mocked in jest.setup.ts

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('./FooterSections', () => ({
  FooterSections: 'FooterSections',
}));

jest.mock('./FooterModules', () => ({
  FooterModules: 'FooterModules',
}));

jest.mock('./components/ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

jest.mock('./FooterParameters', () => ({
  FooterParameters: 'FooterParameters',
}));


jest.mock('../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn()
}));

jest.mock('../../model/useStylesStore', () => ({
  useStylesStore: jest.fn()
}));

jest.mock('../../model/useUIStore', () => ({
  useUIStore: jest.fn()
}));

describe('Footer Component Stability Test', () => {
  const mockUIStoreValue = {
    activeSection: 'none' as SectionType,
    activeModule: 'none' as ModuleType,
    activeParameter: 'none' as ParameterType,
    isDebugEnabled: false,
    setActiveSection: jest.fn(),
    setActiveModule: jest.fn(),
    setActiveParameter: jest.fn(),
    setIsDebugEnabled: jest.fn(),
  };

  const mockHWStoreValue = {
    iso: { value: 100 },
    shutterSpeed: { value: 0.01 },
    ev: { value: 0 },
    temperature: { value: 5000 },
    capabilities: { availableCameras: [] },
  };

  const mockStyleStoreValue = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0 },
    resetEffect: jest.fn(),
  };

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue(mockUIStoreValue);
    (useHardwareStore as unknown as jest.Mock).mockReturnValue(mockHWStoreValue);
    (useStylesStore as unknown as jest.Mock).mockReturnValue(mockStyleStoreValue);
  });

  it('should render correctly in default state', () => {
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when film section is active', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...mockUIStoreValue,
      activeSection: 'film',
      activeModule: 'development',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when texture section is active', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...mockUIStoreValue,
      activeSection: 'film',
      activeModule: 'texture',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });
});

