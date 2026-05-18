import React from 'react';
import { render } from '@testing-library/react-native';
import { GridParam } from './GridParam';

describe('GridParam', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GridParam />);
    expect(toJSON()).toBeDefined();
  });
});
