import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PresetsPanel } from './PresetsPanel';
import { DeletePresetModal } from './DeletePresetModal';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
import { useControlPanelStore } from '@entities/system';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

import { removePreset } from '../../lib/presetActions';

jest.mock('../../lib/presetActions', () => ({
  removePreset: jest.fn(),
}));

describe('PresetsPanel', () => {
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

    useControlPanelStore.setState({
      activeParameter: 'none',
    });
  });

  it('renders favorite button for default preset', () => {
    usePresetStore.setState({ activePresetId: 'default', userPresets: [] });

    const { getByText } = render(<PresetsPanel />);
    const favBtn = getByText('presets.default');

    fireEvent.press(favBtn);
    expect(mockSetFavoritePreset).toHaveBeenCalledWith(null);
  });

  it('renders save button for customized active preset', () => {
    usePresetStore.setState({ activePresetId: 'customized' });

    const { getByText } = render(<PresetsPanel />);
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

    const { getByText } = render(<PresetsPanel />);
    
    // Favorite
    const favBtn = getByText('presets.default');
    fireEvent.press(favBtn);
    expect(mockSetFavoritePreset).toHaveBeenCalledWith('user-123');

    // Quick select
    const quickBtn = getByText('presets.quick_select');
    fireEvent.press(quickBtn);
    expect(mockToggleQuickSelect).toHaveBeenCalledWith('user-123');
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

    const { getByLabelText } = render(
      <>
        <PresetsPanel />
        <DeletePresetModal />
      </>
    );
    const deleteBtn = getByLabelText('Delete preset');

    fireEvent.press(deleteBtn);

    // Press the confirmation button in the custom modal
    const confirmDeleteBtn = getByLabelText('Confirm delete');
    fireEvent.press(confirmDeleteBtn);

    expect(removePreset).toHaveBeenCalledWith('user-123');
  });
});
