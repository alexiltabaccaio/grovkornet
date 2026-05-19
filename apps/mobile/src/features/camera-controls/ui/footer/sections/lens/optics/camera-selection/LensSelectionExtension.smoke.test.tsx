import React from 'react';
import { render } from '@testing-library/react-native';
import { LensSelectionExtension } from './LensSelectionExtension';

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { capabilities: { availableCameras: Array<{ id: string; focalLength35mm: number }> }; cameraId: string; setCameraId: jest.Mock; cameraAuto: boolean; setCameraAuto: jest.Mock }) => unknown) => {
    const state = {
      capabilities: {
        availableCameras: [
          { id: '0', focalLength35mm: 24 },
          { id: '1', focalLength35mm: 50 },
        ],
      },
      cameraId: '0',
      setCameraId: jest.fn(),
      cameraAuto: true,
      setCameraAuto: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('LensSelectionExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LensSelectionExtension />);
    expect(toJSON()).toBeDefined();
  });
});
