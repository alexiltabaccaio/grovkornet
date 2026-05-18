import React from 'react';
import { render } from '@testing-library/react-native';
import { HistogramParam } from './HistogramParam';

describe('HistogramParam', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<HistogramParam />);
    expect(toJSON()).toBeDefined();
  });
});
