import React from 'react';
import { render } from '@testing-library/react-native';
import { NoiseReductionDetailPanel } from './NoiseReductionDetailPanel';

const mockSetNoiseReductionMode = jest.fn();
const mockSetNoiseReductionAuto = jest.fn();

jest.mock('@entities/film', () => ({
  useFilmStore: jest.fn((fn?: (state: any) => any) => {
    const state = {
      noiseReductionMode: { value: 1 },
      setNoiseReductionMode: mockSetNoiseReductionMode,
      noiseReductionAuto: { value: true },
      setNoiseReductionAuto: mockSetNoiseReductionAuto,
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { isDebugEnabled: boolean }) => unknown) => {
    const state = { isDebugEnabled: true };
    return fn ? fn(state) : state;
  }),
  ParameterDetailPanelWrapper: 'ParameterDetailPanelWrapper',
  GenericPillDetailPanel: 'GenericPillDetailPanel',
}));

describe('NoiseReductionDetailPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and invokes onChange and auto-toggle callbacks correctly', () => {
    const { UNSAFE_getByType } = render(<NoiseReductionDetailPanel />);
    const genericPill = UNSAFE_getByType('GenericPillDetailPanel' as any);

    expect(genericPill).toBeDefined();

    // 1. Test getLabel prop
    const getLabel = genericPill.props.getLabel;
    expect(getLabel(0)).toBe('OFF');
    expect(getLabel(1)).toBe('FAST');
    expect(getLabel(2)).toBe('HQ');
    expect(getLabel(99)).toBe('HQ'); // fallback/default

    // 2. Test isActiveShared prop (worklet)
    const isActiveShared = genericPill.props.isActiveShared;
    expect(isActiveShared(1, undefined, 1)).toBe(true);
    expect(isActiveShared(1, undefined, 0)).toBe(false);

    // 3. Test onChange prop
    genericPill.props.onChange(2);
    expect(mockSetNoiseReductionAuto).toHaveBeenCalledWith(false);
    expect(mockSetNoiseReductionMode).toHaveBeenCalledWith(2);

    // 4. Test leftAccessory AutoButton onPress
    const autoButton = genericPill.props.leftAccessory;
    expect(autoButton).toBeDefined();
    expect(autoButton.props.isActive.value).toBe(true);

    autoButton.props.onPress();
    expect(mockSetNoiseReductionAuto).toHaveBeenCalledWith(false); // !true = false
  });
});
