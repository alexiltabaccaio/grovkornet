import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraFlipButton } from './CameraFlipButton';
import { useFilmStore } from '@entities/film';
import { useBodyStore } from '@entities/body';
import { useControlPanelStore } from '@entities/system';
import * as Haptics from 'expo-haptics';

describe('CameraFlipButton Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFilmStore.getState().isSelfieCamera.value = false;
    useBodyStore.getState().setTorchState(1);
    useControlPanelStore.getState().activeSection = 'none';
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<CameraFlipButton />);
    expect(getByTestId('camera-flip-button')).toBeTruthy();
  });

  it('toggles isSelfieCamera and triggers haptic on press', () => {
    const { getByTestId } = render(<CameraFlipButton />);
    const button = getByTestId('camera-flip-button');

    fireEvent.press(button);

    expect(useFilmStore.getState().isSelfieCamera.value).toBe(true);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('leaves the torch and activeSection untouched when switching to selfie mode', () => {
    useControlPanelStore.getState().activeSection = 'lens';
    
    const { getByTestId } = render(<CameraFlipButton />);
    const button = getByTestId('camera-flip-button');

    fireEvent.press(button);

    // Switch to selfie is true, but torch should remain 1 (untouched)
    expect(useBodyStore.getState().torchState.value).toBe(1);
    // Active section should remain 'lens'
    expect(useControlPanelStore.getState().activeSection).toBe('lens');
  });
});
