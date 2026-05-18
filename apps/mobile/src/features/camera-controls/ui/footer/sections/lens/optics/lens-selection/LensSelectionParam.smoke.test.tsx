import React from 'react';
import { render } from '@testing-library/react-native';
import { LensSelectionParam } from './LensSelectionParam';

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'camera_selection',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { capabilities: { availableCameras: Array<{ id: string; focalLength35mm: number }> }; cameraId: string; setCameraId: jest.Mock; cameraAuto: boolean }) => unknown) => {
    const state = {
      capabilities: { availableCameras: [{ id: 'back', focalLength35mm: 24 }] },
      cameraId: 'back',
      setCameraId: jest.fn(),
      cameraAuto: true,
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('LensSelectionParam', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<LensSelectionParam {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
