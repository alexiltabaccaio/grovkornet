import React from 'react';
import { render } from '@testing-library/react-native';
import { NativeRenderer } from './NativeRenderer';

describe('NativeRenderer', () => {
  it('renders without crashing', () => {
    const mockProps = {
      saturation: 1,
      contrast: 1,
      grainIntensity: 0.5,
      grainChroma: 0.5,
      grainSize: 0.5,
      grainEnabled: true,
      chromaticAberration: 0.2,
    };

    const { toJSON } = render(<NativeRenderer {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
