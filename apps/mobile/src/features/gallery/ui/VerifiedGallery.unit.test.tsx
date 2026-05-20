import React from 'react';
import { render } from '@testing-library/react-native';
import { VerifiedGallery } from './VerifiedGallery';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('VerifiedGallery', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<VerifiedGallery onClose={jest.fn()} initialUri={null} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders with initialUri correctly', () => {
    const { toJSON } = render(
      <VerifiedGallery onClose={jest.fn()} initialUri="file:///test/preview.jpg" />
    );
    expect(toJSON()).toBeDefined();
  });
});
