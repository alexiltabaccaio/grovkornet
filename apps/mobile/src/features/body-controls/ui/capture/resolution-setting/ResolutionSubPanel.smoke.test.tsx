import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResolutionSubPanel } from './ResolutionSubPanel';

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

const mockSetPreviewIn4k = jest.fn();


let mockResolutionSettingValue = 0;
let mockPreviewIn4kValue = 0;

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      resolutionSetting: { value: mockResolutionSettingValue },
      previewIn4k: { value: mockPreviewIn4kValue },
      setPreviewIn4k: mockSetPreviewIn4k,
    };
    return fn(state);
  },
}));

describe('ResolutionSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolutionSettingValue = 0;
    mockPreviewIn4kValue = 0;
  });

  it('renders correctly when resolutionSetting is 0', () => {
    const { toJSON, getByText } = render(<ResolutionSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('OFF')).toBeDefined();
  });

  it('renders null when resolutionSetting is not 0', () => {
    mockResolutionSettingValue = 1;
    const { toJSON } = render(<ResolutionSubPanel />);
    expect(toJSON()).toBeNull();
  });

  it('handles toggle press correctly', () => {
    const { getByRole } = render(<ResolutionSubPanel />);
    const btn = getByRole('button');
    fireEvent.press(btn);

    expect(mockSetPreviewIn4k).toHaveBeenCalledWith(1);
  });
});
