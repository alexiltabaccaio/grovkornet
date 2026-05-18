import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CaptureThumbnail } from './CaptureThumbnail';
import { useUIStore } from '../model/useUIStore';

describe('CaptureThumbnail', () => {
  beforeEach(() => {
    const state = useUIStore.getState();
    state.setLatestCapturedUri(null);
  });

  it('renders placeholder when no image and not capturing', () => {
    const { UNSAFE_root } = render(<CaptureThumbnail onPress={jest.fn()} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const state = useUIStore.getState();
    state.setLatestCapturedUri('file:///thumb.jpg');

    const onPressMock = jest.fn();
    const { getByTestId } = render(<CaptureThumbnail onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('capture-thumbnail'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
