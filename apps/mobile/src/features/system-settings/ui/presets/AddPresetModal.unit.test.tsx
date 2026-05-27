import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddPresetModal } from './AddPresetModal';
import { usePresetStore, DEFAULT_FILM_PAYLOAD, DEFAULT_BODY_PAYLOAD } from '@entities/preset';
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

describe('AddPresetModal', () => {
  const mockSetAddModalVisible = jest.fn();
  const mockAddPreset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePresetStore.setState({
      isAddModalVisible: false,
      userPresets: [],
      setAddModalVisible: mockSetAddModalVisible,
      addPreset: mockAddPreset,
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
    const saveBtn = getByText('presets.save');
    const input = getByPlaceholderText('presets.placeholder');

    await waitFor(() => {
      expect(generatePresetPreview).toHaveBeenCalled();
    });

    // 1. Save empty name
    fireEvent.changeText(input, '   ');
    fireEvent.press(saveBtn);
    expect(Alert.alert).toHaveBeenCalledWith('presets.error_title', 'presets.error_empty');

    // 2. Save duplicate name
    const duplicatePreset = {
      id: '1',
      name: 'VINTAGE',
      payload: { film: DEFAULT_FILM_PAYLOAD, body: DEFAULT_BODY_PAYLOAD },
      isFavorite: false,
      inQuickSelect: false,
      createdAt: Date.now(),
    };
    usePresetStore.setState({ userPresets: [duplicatePreset] });

    fireEvent.changeText(input, 'VINTAGE');
    fireEvent.press(saveBtn);
    expect(Alert.alert).toHaveBeenCalledWith('presets.error_title', 'presets.error_duplicate');

    // 3. Save valid preset
    fireEvent.changeText(input, 'UNIQUE_PRESET');
    fireEvent.press(saveBtn);

    expect(mockAddPreset).toHaveBeenCalledWith('UNIQUE_PRESET', expect.any(String));
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
