import React from 'react';
import { render } from '@testing-library/react-native';
import { FlashOverlay } from './FlashOverlay';

jest.mock('@entities/camera', () => ({
  useCameraStore: jest.fn((selector) => selector({
    isCapturing: false,
  })),
}));

describe('FlashOverlay Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<FlashOverlay />);
    expect(toJSON()).toBeDefined();
  });
});
