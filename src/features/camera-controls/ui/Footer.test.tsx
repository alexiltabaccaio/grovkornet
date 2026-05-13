import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';
import { makeMutable } from 'react-native-reanimated';

import { useCameraEffectsContext } from '../model/CameraEffectsContext';

// Mocks for icons and Skia (which often cause issues in node tests)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    RuntimeEffect: {
      Make: jest.fn()
    }
  },
  Canvas: 'Canvas',
  Rect: 'Rect',
  Shader: 'Shader'
}));

jest.mock('../model/CameraEffectsContext', () => ({
  useCameraEffectsContext: jest.fn()
}));

describe('Footer Component Stability Test', () => {
  const mockContextValue = {
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
    frameProcessor: jest.fn(),
  };

  beforeEach(() => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue(mockContextValue);
  });

  it('should render correctly in default state', () => {
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when color tab is active', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContextValue,
      activeTab: 'color',
      activeModule: 'color_grading',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correctly when tape tab is active', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContextValue,
      activeTab: 'tape',
      activeModule: 'grain',
    });
    const { toJSON } = render(<Footer />);
    expect(toJSON()).toBeDefined();
  });
});

