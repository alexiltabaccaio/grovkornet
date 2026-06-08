import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GalleryStripItem } from './GalleryStripItem';
import { GalleryItem } from '../../lib/types';
import { useVerificationStore } from '@entities/verification';

const mockItem: GalleryItem = { uri: 'file:///test/1.jpg', id: '1' };

describe('GalleryStripItem', () => {
  it('renders correctly', () => {
    useVerificationStore.setState({
      verifiedMap: {
        'file:///test/1.jpg': true,
      },
    });

    const onSelectMock = jest.fn();
    const { toJSON, getByTestId } = render(
      <GalleryStripItem
        item={mockItem}
        isSelected={true}
        onSelect={onSelectMock}
      />
    );
    expect(toJSON()).toBeDefined();
    expect(getByTestId('gallery-strip-item-1')).toBeTruthy();
  });

  it('calls onSelect when pressed', () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <GalleryStripItem
        item={mockItem}
        isSelected={false}
        onSelect={onSelectMock}
      />
    );

    fireEvent.press(getByTestId('gallery-strip-item-1'));
    expect(onSelectMock).toHaveBeenCalledWith(mockItem);
  });
});
