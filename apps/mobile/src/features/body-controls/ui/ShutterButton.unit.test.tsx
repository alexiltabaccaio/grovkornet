import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { ShutterButton } from './ShutterButton';

describe('ShutterButton Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles normal press correctly', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<ShutterButton onPress={onPressMock} />);
    const button = getByTestId('shutter-button');

    fireEvent.press(button);

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('handles onPressIn and onPressOut animations and haptics', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<ShutterButton onPress={onPressMock} />);
    const button = getByTestId('shutter-button');

    // onPressIn
    fireEvent(button, 'pressIn');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

    // onPressOut
    fireEvent(button, 'pressOut');
    // Nessun errore generato
  });

  it('does not trigger actions when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<ShutterButton onPress={onPressMock} disabled />);
    const button = getByTestId('shutter-button');

    fireEvent(button, 'pressIn');
    fireEvent.press(button);

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('does not trigger actions when translateY indicates bottom sheet is open', () => {
    const onPressMock = jest.fn();
    const translateY = { value: -60 } as any; // < -50
    const { getByTestId } = render(<ShutterButton onPress={onPressMock} translateY={translateY} />);
    const button = getByTestId('shutter-button');

    fireEvent(button, 'pressIn');
    fireEvent.press(button);

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
