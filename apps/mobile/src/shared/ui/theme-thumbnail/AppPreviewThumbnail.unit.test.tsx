import React from 'react';
import { render } from '@testing-library/react-native';
import { AppPreviewThumbnail } from './AppPreviewThumbnail';

describe('AppPreviewThumbnail', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = render(<AppPreviewThumbnail />);
    expect(toJSON()).toBeDefined();
  });

  it('renders correctly with active state and custom colors', () => {
    const { toJSON } = render(
      <AppPreviewThumbnail
        backgroundColor="#111111"
        footerColor="#222222"
        bottomColor="#333333"
        textColor="#FF3300"
        shutterColor="#FF3300"
        isActive={true}
      />
    );
    expect(toJSON()).toBeDefined();
  });
});
