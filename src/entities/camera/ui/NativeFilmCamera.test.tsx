import React from 'react';
import { render } from '@testing-library/react-native';
import { NativeFilmCamera } from './NativeFilmCamera';

describe('NativeFilmCamera', () => {
  it('renders without crashing', () => {
    const mockProps = {
      saturation: 1,
      contrast: 1,
      grainIntensity: 0.5,
      grainEnabled: true,
      chromaticAberration: 0.2,
    };

    // @ts-expect-error - testing render of native component bridge
    const { toJSON } = render(<NativeFilmCamera {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
