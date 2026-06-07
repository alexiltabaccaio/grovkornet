import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeletePresetModal } from './DeletePresetModal';
import { usePresetStore } from '@entities/preset';
import * as Haptics from '@shared/lib/haptics';
import { removePreset } from '../../lib/presetActions';

// Mock Haptics
jest.mock('@shared/lib/haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

// Mock preset actions
jest.mock('../../lib/presetActions', () => ({
  removePreset: jest.fn(),
}));

// Local Mock for i18next to test default values and interpolation
const mockT = jest.fn((key, defaultValue, options) => {
  if (key === 'presets.delete_body' && options && options.name) {
    return `Sei sicuro di voler eliminare "${options.name}"?`;
  }
  return defaultValue || key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
}));

describe('DeletePresetModal', () => {
  const mockSetDeleteModalVisible = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      isDeleteModalVisible: false,
      setDeleteModalVisible: mockSetDeleteModalVisible,
      userPresets: [
        {
          id: 'preset-1',
          name: 'Classic B&W',
          payload: {} as any,
          isFavorite: false,
          inQuickSelect: false,
          createdAt: Date.now(),
        },
      ],
      activePresetId: 'preset-1',
    });
  });

  it('renders null when isDeleteModalVisible is false', () => {
    const { toJSON } = render(<DeletePresetModal />);
    expect(toJSON()).toBeNull();
  });

  it('renders correctly when isDeleteModalVisible is true', () => {
    usePresetStore.setState({ isDeleteModalVisible: true });

    const { getByText, getByLabelText } = render(<DeletePresetModal />);

    expect(getByText('ELIMINA PRESET')).toBeTruthy();
    expect(getByText(/Classic B\&W/)).toBeTruthy();
    expect(getByLabelText('ANNULLA')).toBeTruthy(); // cancel overlay Pressable
    expect(getByText('ANNULLA')).toBeTruthy(); // cancel button
    expect(getByText('ELIMINA')).toBeTruthy(); // delete button
  });

  it('calls setDeleteModalVisible(false) when cancel button is clicked', () => {
    usePresetStore.setState({ isDeleteModalVisible: true });

    const { getByText } = render(<DeletePresetModal />);
    const cancelBtn = getByText('ANNULLA');

    fireEvent.press(cancelBtn);

    expect(mockSetDeleteModalVisible).toHaveBeenCalledWith(false);
  });

  it('calls setDeleteModalVisible(false) when background overlay is clicked', () => {
    usePresetStore.setState({ isDeleteModalVisible: true });

    const { getByLabelText } = render(<DeletePresetModal />);
    const overlay = getByLabelText('ANNULLA');

    fireEvent.press(overlay);

    expect(mockSetDeleteModalVisible).toHaveBeenCalledWith(false);
  });

  it('performs preset removal, haptic feedback, and closes modal on confirm delete', () => {
    usePresetStore.setState({ isDeleteModalVisible: true });

    const { getByLabelText } = render(<DeletePresetModal />);
    const deleteBtn = getByLabelText('Confirm delete');

    fireEvent.press(deleteBtn);

    expect(mockSetDeleteModalVisible).toHaveBeenCalledWith(false);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(removePreset).toHaveBeenCalledWith('preset-1');
  });

  it('displays Customized as preset name when activePresetId is customized', () => {
    usePresetStore.setState({
      isDeleteModalVisible: true,
      activePresetId: 'customized',
    });

    const { getByText } = render(<DeletePresetModal />);

    expect(getByText(/Custom/)).toBeTruthy();
  });
});
