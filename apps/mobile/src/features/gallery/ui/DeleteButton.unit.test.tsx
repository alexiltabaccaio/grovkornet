import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { DeleteButton } from './DeleteButton';
import { Platform } from 'react-native';

describe('DeleteButton', () => {
  const mockPhoto = { id: 'photo-1', uri: 'file:///images/photo1.jpg' };
  const mockDelete = jest.fn();
  const originalOS = Platform.OS;
  const originalVersion = Platform.Version;

  const setPlatform = (os: 'android' | 'ios', version: number | string) => {
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
    Object.defineProperty(Platform, 'Version', { value: version, configurable: true });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
    Object.defineProperty(Platform, 'Version', { value: originalVersion, configurable: true });
  });

  it('calls onDelete immediately on Android 11+ (API 30+)', async () => {
    setPlatform('android', 30);

    const { getByTestId, queryByTestId } = render(
      <DeleteButton photo={mockPhoto} onDelete={mockDelete} />
    );

    const button = getByTestId('delete-photo-button');
    fireEvent.press(button);

    expect(mockDelete).toHaveBeenCalledWith(mockPhoto);
    expect(queryByTestId('popup-overlay')).toBeNull(); // popup not shown
  });

  it('shows pre-confirmation popup on Android 10- (API < 30)', () => {
    setPlatform('android', 29);

    const { getByTestId } = render(
      <DeleteButton photo={mockPhoto} onDelete={mockDelete} />
    );

    const button = getByTestId('delete-photo-button');
    fireEvent.press(button);

    expect(mockDelete).not.toHaveBeenCalled();
    expect(getByTestId('popup-overlay')).toBeTruthy();
  });

  it('closes popup and does not call onDelete when Cancel is pressed', () => {
    setPlatform('android', 29);

    const { getByTestId, queryByTestId } = render(
      <DeleteButton photo={mockPhoto} onDelete={mockDelete} />
    );

    fireEvent.press(getByTestId('delete-photo-button'));
    fireEvent.press(getByTestId('delete-popup-cancel'));

    expect(mockDelete).not.toHaveBeenCalled();
    expect(queryByTestId('popup-overlay')).toBeNull();
  });

  it('calls onDelete and closes popup when Delete is confirmed in popup', async () => {
    setPlatform('android', 29);

    const { getByTestId } = render(
      <DeleteButton photo={mockPhoto} onDelete={mockDelete} />
    );

    fireEvent.press(getByTestId('delete-photo-button'));
    
    await act(async () => {
      fireEvent.press(getByTestId('delete-popup-confirm'));
    });

    expect(mockDelete).toHaveBeenCalledWith(mockPhoto);
  });

  it('deletes immediately without popup if the photo is a temporary file', async () => {
    setPlatform('android', 29);
    
    const tempPhoto = { id: 'preview-temp', uri: 'file:///data/preview-1.jpg' };

    const { getByTestId, queryByTestId } = render(
      <DeleteButton photo={tempPhoto} onDelete={mockDelete} />
    );

    const button = getByTestId('delete-photo-button');
    fireEvent.press(button);

    expect(mockDelete).toHaveBeenCalledWith(tempPhoto);
    expect(queryByTestId('popup-overlay')).toBeNull();
  });
});
