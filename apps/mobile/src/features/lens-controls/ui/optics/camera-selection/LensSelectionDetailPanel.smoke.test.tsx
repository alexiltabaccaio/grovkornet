import React from 'react';
import { render } from '@testing-library/react-native';
import { LensSelectionDetailPanel } from './LensSelectionDetailPanel';

jest.mock('@entities/lens', () => ({
  useLensStore: jest.fn((fn?: (state: { capabilities: { availableCameras: Array<{ id: string; focalLength35mm: number }> }; cameraId: string; setCameraId: jest.Mock; cameraAuto: boolean; setCameraAuto: jest.Mock }) => unknown) => {
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

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: false };
    return fn ? fn(state) : state;
  }),
  GenericPillDetailPanel: 'GenericPillDetailPanel',
}));

describe('LensSelectionDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LensSelectionDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
