import React from 'react';
import { render } from '@testing-library/react-native';
import { GalleryViewer } from './GalleryViewer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('GalleryViewer', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GalleryViewer onClose={jest.fn()} initialUri={null} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders with initialUri correctly', () => {
    const { toJSON } = render(
      <GalleryViewer onClose={jest.fn()} initialUri="file:///test/preview.jpg" />
    );
    expect(toJSON()).toBeDefined();
  });
});
