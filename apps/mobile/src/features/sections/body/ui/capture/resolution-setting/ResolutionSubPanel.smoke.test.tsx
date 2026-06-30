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

const mockSetPreviewQuality = jest.fn();

let mockResolutionSettingValue = 0;
let mockPreviewQualityValue = 1;

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      resolutionSetting: { value: mockResolutionSettingValue },
      previewQuality: { value: mockPreviewQualityValue },
      setPreviewQuality: mockSetPreviewQuality,
    };
    return fn(state);
  },
}));

describe('ResolutionSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolutionSettingValue = 0;
    mockPreviewQualityValue = 1;
  });

  it('renders correctly', () => {
    const { toJSON, getByText } = render(<ResolutionSubPanel />);
    expect(toJSON()).toBeDefined();
    expect(getByText('parameters.preview_quality_opt')).toBeDefined();
  });

  it('renders even when resolutionSetting is not 0', () => {
    mockResolutionSettingValue = 1;
    const { toJSON } = render(<ResolutionSubPanel />);
    expect(toJSON()).not.toBeNull();
  });

  it('handles option press correctly', () => {
    const { getByLabelText } = render(<ResolutionSubPanel />);
    const btn = getByLabelText('parameters.preview_quality_max');
    fireEvent.press(btn);

    expect(mockSetPreviewQuality).toHaveBeenCalledWith(0);
  });
});
