import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GalleryStrip } from './GalleryStrip';
import { GalleryItem } from '../../lib/types';

const mockPhotos: GalleryItem[] = [
  { uri: 'file:///test/1.jpg', id: '1', isVerified: true },
  { uri: 'file:///test/2.jpg', id: '2', isVerified: false },
  { uri: 'file:///test/3.jpg', id: '3' },
];

describe('GalleryStrip', () => {
  it('renders correctly with photos', () => {
    const { toJSON, getByLabelText, getByTestId } = render(
      <GalleryStrip
        photos={mockPhotos}
        selectedPhoto={mockPhotos[0]}
        onSelectPhoto={jest.fn()}
        onClose={jest.fn()}
      />
    );
    expect(toJSON()).toBeDefined();
    expect(getByLabelText('Go back')).toBeTruthy();
    expect(getByTestId('gallery-strip-item-1')).toBeTruthy();
    expect(getByTestId('gallery-strip-item-2')).toBeTruthy();
    expect(getByTestId('gallery-strip-item-3')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onCloseMock = jest.fn();
    const { getByLabelText } = render(
      <GalleryStrip
        photos={mockPhotos}
        selectedPhoto={mockPhotos[0]}
        onSelectPhoto={jest.fn()}
        onClose={onCloseMock}
      />
    );

    fireEvent.press(getByLabelText('Go back'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectPhoto when a photo thumbnail is pressed', () => {
    const onSelectPhotoMock = jest.fn();
    const { getByTestId } = render(
      <GalleryStrip
        photos={mockPhotos}
        selectedPhoto={mockPhotos[0]}
        onSelectPhoto={onSelectPhotoMock}
        onClose={jest.fn()}
      />
    );

    fireEvent.press(getByTestId('gallery-strip-item-2'));
    expect(onSelectPhotoMock).toHaveBeenCalledWith(mockPhotos[1]);
  });
});
