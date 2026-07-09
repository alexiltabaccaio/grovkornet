import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

    expect(inner.props.style).toEqual(
      expect.objectContaining({
        transform: expect.arrayContaining([
          expect.objectContaining({ scale: 1.5 }),
          expect.objectContaining({ rotate: '90deg' })
        ])
      })
    );
  });
});
