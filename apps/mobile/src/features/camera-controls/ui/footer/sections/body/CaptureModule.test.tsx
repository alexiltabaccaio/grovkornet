import React from 'react';
import { render } from '@testing-library/react-native';
import { CaptureModule } from './CaptureModule';

jest.mock('./capture/aspect-ratio/AspectRatioParam', () => ({
  AspectRatioParam: () => null,
}));

jest.mock('./capture/resolution/ResolutionParam', () => ({
  ResolutionParam: () => null,
}));

jest.mock('./capture/fps/FpsParam', () => ({
  FpsParam: () => null,
}));

describe('CaptureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<CaptureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
