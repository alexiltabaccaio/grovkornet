import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddPresetModal } from './AddPresetModal';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD, DEFAULT_LENS_PAYLOAD } from '@entities/preset';
import { Alert, BackHandler } from 'react-native';
import { generatePresetPreview } from '@grovkornet/engine';

jest.mock('@grovkornet/engine', () => ({
  generatePresetPreview: jest.fn().mockResolvedValue('file:///cache/preset_preview_mock.jpg'),
  deleteFile: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(true),
      localUri: 'file:///assets/monoscope.jpg',
      uri: 'file:///assets/monoscope.jpg',
    })),
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

import { addPreset, removePreset } from '../lib/presetActions';

jest.mock('../lib/presetActions', () => ({
  addPreset: jest.fn(),
  removePreset: jest.fn(),
}));

describe('AddPresetModal', () => {
  const mockSetAddModalVisible = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      isAddModalVisible: false,
      userPresets: [],
      setAddModalVisible: mockSetAddModalVisible,
    });
  });

  it('renders null when isAddModalVisible is false', () => {
    usePresetStore.setState({ isAddModalVisible: false });
    const { toJSON } = render(<AddPresetModal />);
    expect(toJSON()).toBeNull();
  });

  it('renders overlay, preview, text input, and handles cancel action', async () => {
    usePresetStore.setState({ isAddModalVisible: true });

    const { getByText } = render(<AddPresetModal />);

    // Verify layout
    expect(getByText('presets.save_title')).toBeTruthy();
    const cancelBtn = getByText('presets.cancel');

    await waitFor(() => {
      expect(generatePresetPreview).toHaveBeenCalled();
    });

    fireEvent.press(cancelBtn);
    expect(mockSetAddModalVisible).toHaveBeenCalledWith(false);
  });

  it('handles save action validation and successfully creates preset', async () => {
    usePresetStore.setState({ isAddModalVisible: true });

    const { getByText, getByPlaceholderText } = render(<AddPresetModal />);
    const saveBtn = getByText('PRESETS.SAVE');
    const input = getByPlaceholderText('presets.placeholder');

    await waitFor(() => {
      expect(generatePresetPreview).toHaveBeenCalled();
    });

    // 1. Save empty name (should be disabled, so no alert is shown)
    fireEvent.changeText(input, '   ');
    fireEvent.press(saveBtn);
    expect(Alert.alert).not.toHaveBeenCalled();

    // 2. Save duplicate name (should enter overwrite mode)
    const duplicatePreset = {
      id: '1',
      name: 'VINTAGE',
      payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD, lens: DEFAULT_LENS_PAYLOAD },
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };
    usePresetStore.setState({ userPresets: [duplicatePreset] });

    fireEvent.changeText(input, 'VINTAGE');
    fireEvent.press(saveBtn);
    
    // Verify it enters overwrite mode (title changes, buttons change)
    expect(getByText('presets.overwrite_title')).toBeTruthy();
    expect(getByText('common.yes')).toBeTruthy();
    expect(getByText('common.no')).toBeTruthy();
    
    // 2.1 Pressing "NO" (which replaces CANCEL) should return to normal mode
    fireEvent.press(getByText('common.no'));
    expect(getByText('presets.save_title')).toBeTruthy();
    expect(getByText('presets.cancel')).toBeTruthy();
    expect(getByText('PRESETS.SAVE')).toBeTruthy();
    
    // Re-enter overwrite mode
    fireEvent.press(saveBtn);
    expect(getByText('presets.overwrite_title')).toBeTruthy();
    
    // 2.2 Changing the text input should return to normal mode
    fireEvent.changeText(input, 'VINTAG');
    expect(getByText('presets.save_title')).toBeTruthy();
    
    // 2.3 Pressing SI should delete the old preset and save the new one
    // First type duplicate name again and press save to enter overwrite mode
    fireEvent.changeText(input, 'VINTAGE');
    fireEvent.press(saveBtn);
    expect(getByText('presets.overwrite_title')).toBeTruthy();
    
    (addPreset as jest.Mock).mockClear();
    (removePreset as jest.Mock).mockClear();
    
    fireEvent.press(getByText('common.yes'));
    
    expect(removePreset).toHaveBeenCalledWith('1');
    expect(addPreset).toHaveBeenCalledWith('VINTAGE', expect.any(String));
    expect(mockSetAddModalVisible).toHaveBeenCalledWith(false);

    // 3. Save valid preset (directly without duplicate check)
    (addPreset as jest.Mock).mockClear();
    await waitFor(() => {
      fireEvent.changeText(input, 'UNIQUE_PRESET');
      fireEvent.press(saveBtn);
      expect(addPreset).toHaveBeenCalledWith('UNIQUE_PRESET', expect.any(String));
    });
    expect(mockSetAddModalVisible).toHaveBeenCalledWith(false);
  });

  it('handles hardware back button presses correctly', () => {
    const addListenerSpy = jest.spyOn(BackHandler, 'addEventListener');

    usePresetStore.setState({ isAddModalVisible: true });
    render(<AddPresetModal />);

    // Find the hardwareBackPress handler from addEventListener calls
    const calls = addListenerSpy.mock.calls;
    const hardwareBackPressCall = calls.find(c => c[0] === 'hardwareBackPress');
    expect(hardwareBackPressCall).toBeDefined();

    const handler = hardwareBackPressCall![1];
    const backHandled = handler();
    expect(backHandled).toBe(true);
    expect(mockSetAddModalVisible).toHaveBeenCalledWith(false);

    addListenerSpy.mockRestore();
  });
});
