import React from 'react';
import { render } from '@testing-library/react-native';
import { LightingModule } from './LightingModule';

jest.mock('./lighting/torch/TorchParam', () => ({
  TorchParam: () => null,
}));

describe('LightingModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<LightingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
