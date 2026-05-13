import React from 'react';
import { render } from '@testing-library/react-native';
import { GestureController } from './GestureController';
import { useCameraEffectsContext } from '../model/CameraEffectsContext';

// Mock the context
jest.mock('../model/CameraEffectsContext');

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
  runOnJS: jest.fn((fn) => fn),
}));
// Mock Worklets Core
jest.mock('react-native-worklets-core', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
}));

// Mock Vision Camera
jest.mock('react-native-vision-camera', () => ({
  useSkiaFrameProcessor: jest.fn(),
  VisionCameraProxy: {
    initFrameProcessor: jest.fn(),
  },
}));

// Mock Skia
jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    RuntimeEffect: {
      Make: jest.fn(),
    },
    Shader: jest.fn(),
  },
}));

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
  const mockContext = {
    grainIntensity: { value: 0.5 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 },
    chromaticAberration: { value: 0.0 },
    setGrainIntensity: jest.fn(),
    setSaturation: jest.fn(),
    setContrast: jest.fn(),
    setChromaticAberration: jest.fn(),
    activeModule: 'none',
    activeParameter: 'none',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCameraEffectsContext as jest.Mock).mockReturnValue(mockContext);
  });

  it('should render null when activeModule is "none"', () => {
    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly when activeModule is "grain"', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContext,
      activeModule: 'grain',
      activeParameter: 'grain',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "color_grading"', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContext,
      activeModule: 'color_grading',
      activeParameter: 'saturation',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render correctly when activeModule is "lens_effects"', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContext,
      activeModule: 'lens_effects',
      activeParameter: 'chromatic_aberration',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });

  it('should render null for unknown modules', () => {
    (useCameraEffectsContext as jest.Mock).mockReturnValue({
      ...mockContext,
      activeModule: 'something_else',
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });
});
