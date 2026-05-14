import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';

import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { useUIStore } from '../model/useUIStore';
import { TabType, ModuleType, ParameterType } from '@shared/types/camera';

// Mocks for icons and Skia (which often cause issues in node tests)
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



jest.mock('./FooterTabs', () => ({
  FooterTabs: 'FooterTabs',
}));

jest.mock('./FooterModules', () => ({
  FooterModules: 'FooterModules',
}));

jest.mock('./FooterParameterControl', () => ({
  FooterParameterControl: 'FooterParameterControl',
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
    activeTab: 'none' as TabType,
    activeModule: 'none' as ModuleType,
    activeParameter: 'none' as ParameterType,
    isDebugEnabled: false,
    setActiveTab: jest.fn(),
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

  it('should render correctly when color tab is active', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...mockUIStoreValue,
      activeTab: 'color',
      activeModule: 'color_grading',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when tape tab is active', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      ...mockUIStoreValue,
      activeTab: 'tape',
      activeModule: 'grain',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });
});

