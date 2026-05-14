import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';

import { useCameraEffectsStore } from '../model/useCameraEffectsStore';

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

describe('Footer Component Stability Test', () => {
  const mockStoreValue = {
    activeTab: 'none',
    setActiveTab: jest.fn(),
    activeModule: 'none',
    setActiveModule: jest.fn(),
    activeParameter: 'none',
    setActiveParameter: jest.fn(),
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0 },
    setGrainIntensity: jest.fn(),
    setSaturation: jest.fn(),
    setContrast: jest.fn(),
    setChromaticAberration: jest.fn(),
    resetTool: jest.fn(),
    isDebugEnabled: false,
    setIsDebugEnabled: jest.fn(),
  };

  beforeEach(() => {
    (useCameraEffectsStore as unknown as jest.Mock).mockReturnValue(mockStoreValue);
  });

  it('should render correctly in default state', () => {
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when color tab is active', () => {
    (useCameraEffectsStore as unknown as jest.Mock).mockReturnValue({
      ...mockStoreValue,
      activeTab: 'color',
      activeModule: 'color_grading',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when tape tab is active', () => {
    (useCameraEffectsStore as unknown as jest.Mock).mockReturnValue({
      ...mockStoreValue,
      activeTab: 'tape',
      activeModule: 'grain',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });
});

