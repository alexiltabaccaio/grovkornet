import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';

import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { useUIStore } from '../model/useUIStore';
import { SectionType, ModuleType, ParameterType } from '@shared/types/camera';

// Mocks for icons (which often cause issues in node tests)
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  const Reanimated = {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    runOnJS: jest.fn((fn) => fn),
    makeMutable: jest.fn((val) => ({ value: val })),
    createAnimatedComponent: jest.fn((comp) => comp),
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    View: View,
  };
  return {
    ...Reanimated,
    default: Reanimated,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('./FooterSections', () => ({
  FooterSections: 'FooterSections',
}));

jest.mock('./FooterModules', () => ({
  FooterModules: 'FooterModules',
}));

jest.mock('./ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

jest.mock('./FooterParameters', () => ({
  FooterParameters: 'FooterParameters',
}));

jest.mock('@shared/ui', () => ({
  LanguageThumb: 'LanguageThumb',
  DebugThumb: 'DebugThumb',
}));

jest.mock('../model/useCameraEffectsStore', () => ({
  useCameraEffectsStore: jest.fn()
}));

jest.mock('../model/useUIStore', () => ({
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

  const mockCameraStoreValue = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0 },
    setGrainIntensity: jest.fn(),
    setSaturation: jest.fn(),
    setContrast: jest.fn(),
    setChromaticAberration: jest.fn(),
    resetTool: jest.fn(),
  };

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue(mockUIStoreValue);
    (useCameraEffectsStore as unknown as jest.Mock).mockReturnValue(mockCameraStoreValue);
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

