import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { makeMutable } from 'react-native-reanimated';
import { CaptureThumbnail } from './CaptureThumbnail';
import { useGalleryStore } from '@entities/gallery';
import { useDeviceRotation } from '@shared/lib/hooks/useDeviceRotation';

jest.mock('@shared/lib/hooks/useDeviceRotation', () => ({
  useDeviceRotation: jest.fn(),
}));

describe('CaptureThumbnail', () => {
  const mockRotation = makeMutable(0);

  beforeEach(() => {
    const state = useGalleryStore.getState();
    state.setLatestCapturedUri(null);
    state.setLatestPreviewUri(null);
    mockRotation.value = 0;
    (useDeviceRotation as jest.Mock).mockReturnValue(mockRotation);
  });

  it('renders placeholder when no image and not capturing', () => {
    const { UNSAFE_root } = render(<CaptureThumbnail onPress={jest.fn()} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const state = useGalleryStore.getState();
    state.setLatestCapturedUri('file:///thumb.jpg');

    const onPressMock = jest.fn();
    const { getByTestId } = render(<CaptureThumbnail onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('capture-thumbnail'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('applies rotation transform based on device rotation', () => {
    mockRotation.value = 90;
    const state = useGalleryStore.getState();
    state.setLatestCapturedUri('file:///thumb.jpg');

    const { getByTestId } = render(<CaptureThumbnail onPress={jest.fn()} />);
    const inner = getByTestId('capture-thumbnail-inner');
    const flattened = StyleSheet.flatten(inner.props.style);

    expect(flattened).toEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ scale: 1.5 }),
          expect.objectContaining({ rotate: '90deg' })
        ])
      })
    );
  });

  it('applies counter-rotation to preview image', () => {
    mockRotation.value = 90;
    const state = useGalleryStore.getState();
    state.setLatestPreviewUri('file:///data/preview.jpg');

    const { getByTestId } = render(<CaptureThumbnail onPress={jest.fn()} />);
    const currentImg = getByTestId('capture-thumbnail-current');
    const flattened = StyleSheet.flatten(currentImg.props.style);

    expect(flattened).toEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ rotate: '-90deg' })
        ])
      })
    );
  });

  it('renders final captured image with 0 rotation as overlay', () => {
    mockRotation.value = 90;
    const state = useGalleryStore.getState();
    
    // Start with preview
    state.setLatestPreviewUri('file:///data/preview.jpg');
    const { getByTestId } = render(<CaptureThumbnail onPress={jest.fn()} />);
    
    // Transition to final capture
    const { act } = require('@testing-library/react-native');
    act(() => {
      state.setLatestCapturedUri('file:///captured.jpg');
      state.setLatestPreviewUri(null);
    });

    const overlay = getByTestId('capture-thumbnail-overlay');
    const flattened = StyleSheet.flatten(overlay.props.style);

    expect(flattened).toEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ rotate: '0deg' })
        ])
      })
    );
  });
});
