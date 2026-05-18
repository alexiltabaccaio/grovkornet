import React from 'react';
import { render } from '@testing-library/react-native';
import { VignetteParam } from './VignetteParam';

describe('VignetteParam', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<VignetteParam />);
    expect(toJSON()).toBeDefined();
  });
});
