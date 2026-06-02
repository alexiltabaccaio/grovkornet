import React from 'react';
import { render } from '@testing-library/react-native';
import { LensSelectionPanel } from './LensSelectionPanel';

const mockSetCameraId = jest.fn();
const mockSetCameraAuto = jest.fn();

jest.mock('@entities/lens', () => ({
  useLensStore: jest.fn((fn?: (state: any) => any) => {
    const state = {
      capabilities: {
        availableCameras: [
          { id: '0', focalLength35mm: 24 },
          { id: '1', focalLength35mm: 50 },
        ],
      },
      cameraId: '0',
      setCameraId: mockSetCameraId,
      cameraAuto: true,
      setCameraAuto: mockSetCameraAuto,
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: true };
    return fn ? fn(state) : state;
  }),
  GenericPillPanel: 'GenericPillPanel',
}));

describe('LensSelectionPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and invokes onChange and auto-toggle callbacks correctly', () => {
    const { UNSAFE_getByType } = render(<LensSelectionPanel />);
    const genericPill = UNSAFE_getByType('GenericPillPanel' as any);

    expect(genericPill).toBeDefined();

    // 1. Test getLabel prop
    const getLabel = genericPill.props.getLabel;
    expect(getLabel({ id: '0', focalLength35mm: 24 })).toBe('24mm');
    expect(getLabel({ id: '1', focalLength35mm: 50 })).toBe('50mm');

    // 2. Test isActiveStatic prop
    const isActiveStatic = genericPill.props.isActiveStatic;
    // In state cameraAuto is true, so isActiveStatic should return false
    expect(isActiveStatic({ id: '0' })).toBe(false);

    // 3. Test onChange prop
    genericPill.props.onChange({ id: '1', focalLength35mm: 50 });
    expect(mockSetCameraAuto).toHaveBeenCalledWith(false);
    expect(mockSetCameraId).toHaveBeenCalledWith('1');

    // 4. Test leftAccessory AutoButton onPress
    const autoButton = genericPill.props.leftAccessory;
    expect(autoButton).toBeDefined();
    expect(autoButton.props.isActive).toBe(true);

    autoButton.props.onPress();
    expect(mockSetCameraAuto).toHaveBeenCalledWith(false); // !true = false
  });
});
