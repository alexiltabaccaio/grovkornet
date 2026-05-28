import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PresetsDetailPanel } from './PresetsDetailPanel';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useSystemStore } from '@entities/system';
import { Alert } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

import { removePreset } from '../../lib/presetActions';

jest.mock('../../lib/presetActions', () => ({
  removePreset: jest.fn(),
}));

describe('PresetsDetailPanel', () => {
  const mockSetFavoritePreset = jest.fn();
  const mockToggleQuickSelect = jest.fn();
  const mockSetAddModalVisible = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      activePresetId: 'default',
      userPresets: [],
      setFavoritePreset: mockSetFavoritePreset,
      toggleQuickSelect: mockToggleQuickSelect,
      setAddModalVisible: mockSetAddModalVisible,
    });

    useSystemStore.setState({
      activeParameter: 'none',
    });
  });

  it('renders favorite button for default preset', () => {
    usePresetStore.setState({ activePresetId: 'default', userPresets: [] });

    const { getByText } = render(<PresetsDetailPanel />);
    const favBtn = getByText('presets.default');

    fireEvent.press(favBtn);
    expect(mockSetFavoritePreset).toHaveBeenCalledWith(null);
  });

  it('renders save button for customized active preset', () => {
    usePresetStore.setState({ activePresetId: 'customized' });

    const { getByText } = render(<PresetsDetailPanel />);
    const saveBtn = getByText('presets.save');

    fireEvent.press(saveBtn);
    expect(mockSetAddModalVisible).toHaveBeenCalledWith(true);
  });

  it('renders full actions for user presets and handles toggling favorite/quick select', () => {
    const activeUserPreset = {
      id: 'user-123',
      name: 'Retro123',
      payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };

    usePresetStore.setState({
      activePresetId: 'user-123',
      userPresets: [activeUserPreset],
    });

    const { getByText } = render(<PresetsDetailPanel />);
    
    // Favorite
    const favBtn = getByText('presets.default');
    fireEvent.press(favBtn);
    expect(mockSetFavoritePreset).toHaveBeenCalledWith('user-123');

    // Quick select
    const quickBtn = getByText('presets.quick_select');
    fireEvent.press(quickBtn);
    expect(mockToggleQuickSelect).toHaveBeenCalledWith('user-123');
  });

  it('handles toggleQuickSelect limit exceeded correctly', () => {
    const activeUserPreset = {
      id: 'user-123',
      name: 'Retro123',
      payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };

    usePresetStore.setState({
      activePresetId: 'user-123',
      userPresets: [activeUserPreset],
    });

    mockToggleQuickSelect.mockImplementationOnce(() => {
      throw new Error('LIMIT_EXCEEDED');
    });

    const { getByText } = render(<PresetsDetailPanel />);
    const quickBtn = getByText('presets.quick_select');

    fireEvent.press(quickBtn);
    expect(Alert.alert).toHaveBeenCalledWith('presets.limit_title', 'presets.limit_body');
  });

  it('handles preset deletion confirmation dialog', () => {
    const activeUserPreset = {
      id: 'user-123',
      name: 'Retro123',
      payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };

    usePresetStore.setState({
      activePresetId: 'user-123',
      userPresets: [activeUserPreset],
    });

    const { getByText } = render(<PresetsDetailPanel />);
    const deleteBtn = getByText('presets.delete');

    fireEvent.press(deleteBtn);

    expect(Alert.alert).toHaveBeenCalledWith(
      'presets.delete_title',
      expect.any(String),
      expect.any(Array)
    );

    // Trigger deletion action directly from mock
    const deleteAction = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    deleteAction.onPress();

    expect(removePreset).toHaveBeenCalledWith('user-123');
  });
});
