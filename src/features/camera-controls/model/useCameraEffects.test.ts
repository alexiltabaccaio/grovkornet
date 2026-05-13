import { renderHook, act } from '@testing-library/react-native';
import { useCameraEffects } from './useCameraEffects';

import { DEFAULT_GRAIN_INTENSITY } from '@shared/constants/videoProcessing';

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
}));

// Mock Worklets Core
jest.mock('react-native-worklets-core', () => ({
  useSharedValue: jest.fn((val) => ({ value: val })),
}));

// Mock useFilmFrameProcessor (which is now in entities)
jest.mock('@entities/camera', () => ({

  useFilmFrameProcessor: jest.fn(() => ({})),
}));

describe('useCameraEffects (FSD Migrated)', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCameraEffects());

    expect(result.current.activeTab).toBe('none');
    expect(result.current.grainIntensity.value).toBe(DEFAULT_GRAIN_INTENSITY);
  });

  it('should handle navigation state correctly', () => {
    const { result } = renderHook(() => useCameraEffects());

    act(() => {
      result.current.setActiveTab('color');
      result.current.setActiveModule('color_grading');
    });

    expect(result.current.activeTab).toBe('color');
    expect(result.current.activeModule).toBe('color_grading');
  });
});
