import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AspectRatioSubPanel } from './AspectRatioSubPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@shared/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
  },
}));

const mockSetForce4k60fpsCrop = jest.fn();
const mockSetForce4k60fpsCropPref = jest.fn();

// Mock useAnimatedReaction since we don't need real animated reaction in smoke test
jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual('react-native-reanimated/mock');
  return {
    ...reanimated,
    useAnimatedReaction: jest.fn(),
  };
});

jest.mock('@entities/preferences', () => ({
  usePreferencesStore: {
    getState: () => ({
      setForce4k60fpsCropPref: mockSetForce4k60fpsCropPref,
    }),
  },
}));

let mockResolutionSettingValue = 0;
let mockAspectRatioValue = 2; // non 1, non 4
let mockForce4k60fpsCropValue = 0;

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      resolutionSetting: { value: mockResolutionSettingValue },
      aspectRatio: { value: mockAspectRatioValue },
      force4k60fpsCrop: { value: mockForce4k60fpsCropValue },
      setForce4k60fpsCrop: mockSetForce4k60fpsCrop,
    };
    return fn(state);
  },
}));

describe('AspectRatioSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolutionSettingValue = 0;
    mockAspectRatioValue = 2;
    mockForce4k60fpsCropValue = 0;
  });

  it('renders correctly when conditions are met', () => {
    const { toJSON, getByText } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('OFF')).toBeDefined();
  });

  it('renders null when resolutionSetting is not 0', () => {
    mockResolutionSettingValue = 1;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeNull();
  });

  it('renders null when aspectRatio is 1', () => {
    mockAspectRatioValue = 1;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeNull();
  });

  it('renders null when aspectRatio is 4', () => {
    mockAspectRatioValue = 4;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeNull();
  });

  it('handles toggle press correctly', () => {
    const { getByRole } = render(<AspectRatioSubPanel />);
    const btn = getByRole('button');
    fireEvent.press(btn);

    expect(mockSetForce4k60fpsCrop).toHaveBeenCalledWith(1);
    expect(mockSetForce4k60fpsCropPref).toHaveBeenCalledWith(1);
  });
});
