import { renderHook } from '@testing-library/react-native';
import { useLensWorklets } from './useLensWorklets';
import { useLensStore } from '../model/useLensStore';
import { updateSharedValue } from '@shared/lib/reanimated/safeUpdate';

// Mock useLensStore
const mockFocusDistance = { value: 0 };
const mockFocusAuto = { value: true };

jest.mock('../model/useLensStore', () => ({
  useLensStore: {
    getState: jest.fn(() => ({
      focusDistance: mockFocusDistance,
      focusAuto: mockFocusAuto,
    })),
  },
}));

// Mock safeUpdate
jest.mock('@shared/lib/reanimated/safeUpdate', () => ({
  updateSharedValue: jest.fn((sv, val) => {
    if (sv) sv.value = val;
  }),
}));

describe('useLensWorklets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusDistance.value = 0.5;
    mockFocusAuto.value = true;
  });

  it('updates focusDistance and disables auto-focus on updateFocusDistance', () => {
    const { result } = renderHook(() => useLensWorklets());

    result.current.updateFocusDistance(0.8);

    expect(updateSharedValue).toHaveBeenCalledWith(mockFocusDistance, 0.8);
    expect(updateSharedValue).toHaveBeenCalledWith(mockFocusAuto, false);
    expect(mockFocusDistance.value).toBe(0.8);
    expect(mockFocusAuto.value).toBe(false);
  });
});
