import React from 'react';
import { render } from '@testing-library/react-native';
import { makeMutable } from 'react-native-reanimated';
import { AnimatedSlot } from './AnimatedSlot';
import { GalleryItem } from '../../lib/types';

describe('AnimatedSlot', () => {
  it('renders AnimatedSlot correctly with image uri', () => {
    const mockPhoto: GalleryItem = { uri: 'file:///test/1.jpg', id: '1' };
    const translateX = makeMutable(0);

    const { toJSON } = render(
      <AnimatedSlot
        photo={mockPhoto}
        index={0}
        translateX={translateX}
        slotWidth={300}
        gap={10}
      />
    );
    expect(toJSON()).toBeDefined();
  });

  it('renders correctly when rotationY is provided', () => {
    const mockPhoto: GalleryItem = { uri: 'file:///test/1.jpg', id: '1' };
    const translateX = makeMutable(0);
    const rotationY = makeMutable(90);

    const { toJSON } = render(
      <AnimatedSlot
        photo={mockPhoto}
        index={0}
        translateX={translateX}
        slotWidth={300}
        gap={10}
        rotationY={rotationY}
      />
    );
    expect(toJSON()).toBeDefined();
  });
});
