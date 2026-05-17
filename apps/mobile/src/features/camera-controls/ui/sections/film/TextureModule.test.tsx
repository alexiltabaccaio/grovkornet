import React from 'react';
import { render } from '@testing-library/react-native';
import { TextureModule } from './TextureModule';

jest.mock('../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn) => fn({
    activeParameter: 'grain',
    setActiveParameter: jest.fn(),
  })),
}));

jest.mock('../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn) => fn({
    grainIntensity: { value: 0.5 },
    setGrainIntensity: jest.fn(),
    noiseReductionAuto: { value: true },
    setNoiseReductionAuto: jest.fn(),
    noiseReductionMode: { value: 1 },
    setNoiseReductionMode: jest.fn(),
    sharpening: { value: 0 },
    setSharpening: jest.fn(),
  })),
}));

jest.mock('../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('TextureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<TextureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('passes grainIntensity to Grain ParameterControl', () => {
    const { UNSAFE_getAllByType } = render(<TextureModule {...mockProps} />);
    const controls = UNSAFE_getAllByType('ParameterControl' as any);
    const grainControl = controls.find((c: any) => c.props.label === 'parameters.grain');
    expect(grainControl).toBeDefined();
    expect(grainControl.props.value).toEqual({ value: 0.5 });
  });
});
