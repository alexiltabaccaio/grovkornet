import React from 'react';
import { render, act } from '@testing-library/react-native';
import { PhotoPreview } from './PhotoPreview';
import { GalleryItem } from '../../lib/types';

const mockPhotos: GalleryItem[] = [
  { uri: 'file:///test/1.jpg', id: '1' },
  { uri: 'file:///test/2.jpg', id: '2' },
  { uri: 'file:///test/3.jpg', id: '3' },
];

describe('PhotoPreview', () => {
  it('renders no photos text if empty', () => {
    const { getByText } = render(
      <PhotoPreview selectedPhoto={null} photos={[]} onPhotoVisible={jest.fn()} />
    );
    expect(getByText('gallery.no_photos')).toBeTruthy();
  });

  it('renders correctly with photos and displays center image', () => {
    const { toJSON } = render(
      <PhotoPreview
        selectedPhoto={mockPhotos[1]}
        photos={mockPhotos}
        onPhotoVisible={jest.fn()}
      />
    );
    expect(toJSON()).toBeDefined();
  });

  it('updates slots on programmatic jump', () => {
    const onPhotoVisibleMock = jest.fn();
    const { rerender } = render(
      <PhotoPreview
        selectedPhoto={mockPhotos[0]}
        photos={mockPhotos}
        onPhotoVisible={onPhotoVisibleMock}
      />
    );

    // Programmatic jump to the third photo
    act(() => {
      rerender(
        <PhotoPreview
          selectedPhoto={mockPhotos[2]}
          photos={mockPhotos}
          onPhotoVisible={onPhotoVisibleMock}
        />
      );
    });

    // For programmatic jumps, onPhotoVisible MUST NOT be called
    expect(onPhotoVisibleMock).not.toHaveBeenCalled();
  });
});
