import React from 'react';
import { render } from '@testing-library/react-native';
import { GestureController } from './GestureController';
import { useCameraEffectsStore } from '../model/useCameraEffectsStore';
import { useUIStore } from '../model/useUIStore';

// Mock the stores
jest.mock('../model/useCameraEffectsStore');
jest.mock('../model/useUIStore');

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    runOnJS: jest.fn((fn) => fn),
    makeMutable: jest.fn((val) => ({ value: val })),
    createAnimatedComponent: jest.fn((comp) => comp),
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    View: View,
  };
});






// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
  };
});

describe('GestureController', () => {
  const mockCameraStore = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0.0 },
    setGrainIntensity: jest.fn(),
    setSaturation: jest.fn(),
    setContrast: jest.fn(),
    setChromaticAberration: jest.fn(),
  };

  const mockUIStore = {
    activeModule: 'none',
    activeParameter: 'none',
    activeSubParameter: 'none',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCameraEffectsStore as unknown as jest.Mock).mockReturnValue(mockCameraStore);
    (useUIStore as unknown as jest.Mock).mockReturnValue(mockUIStore);
  });

  it('should render null when activeModule is "none"', () => {
    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly when activeModule is "grain"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'grain',
      activeParameter: 'grain',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "color_grading"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'color_grading',
      activeParameter: 'saturation',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "lens_effects"', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'lens_effects',
      activeParameter: 'chromatic_aberration',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render null for unknown modules', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      activeModule: 'something_else',
      activeParameter: 'none',
      activeSubParameter: 'none',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });
});
