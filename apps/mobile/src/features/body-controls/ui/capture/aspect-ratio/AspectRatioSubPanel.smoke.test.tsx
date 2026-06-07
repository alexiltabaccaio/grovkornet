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

const mockSetForce60fpsCrop = jest.fn();
const mockSetForce60fpsCropPref = jest.fn();



jest.mock('@entities/preferences', () => ({
  usePreferencesStore: {
    getState: () => ({
      setForce60fpsCropPref: mockSetForce60fpsCropPref,
    }),
  },
}));

let mockResolutionSettingValue = 0;
let mockAspectRatioValue = 2; // non 1, non 4
let mockForce60fpsCropValue = 0;

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      resolutionSetting: { value: mockResolutionSettingValue },
      aspectRatio: { value: mockAspectRatioValue },
      force60fpsCrop: { value: mockForce60fpsCropValue },
      setForce60fpsCrop: mockSetForce60fpsCrop,
    };
    return fn(state);
  },
}));

describe('AspectRatioSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolutionSettingValue = 0;
    mockAspectRatioValue = 2;
    mockForce60fpsCropValue = 0;
  });

  it('renders correctly when conditions are met', () => {
    const { toJSON, getByText } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('OFF')).toBeDefined();
  });

  it('renders correctly when resolutionSetting is 1 (1440p)', () => {
    mockResolutionSettingValue = 1;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders null when resolutionSetting is 2 (1080p)', () => {
    mockResolutionSettingValue = 2;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).toBeNull();
  });

  it('does not render null when aspectRatio is 1', () => {
    mockAspectRatioValue = 1;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).not.toBeNull();
  });

  it('does not render null when aspectRatio is 4', () => {
    mockAspectRatioValue = 4;
    const { toJSON } = render(<AspectRatioSubPanel />);
    expect(toJSON()).not.toBeNull();
  });

  it('handles toggle press correctly', () => {
    const { getByRole } = render(<AspectRatioSubPanel />);
    const btn = getByRole('button');
    fireEvent.press(btn);

    expect(mockSetForce60fpsCrop).toHaveBeenCalledWith(1);
    expect(mockSetForce60fpsCropPref).toHaveBeenCalledWith(1);
  });
});
