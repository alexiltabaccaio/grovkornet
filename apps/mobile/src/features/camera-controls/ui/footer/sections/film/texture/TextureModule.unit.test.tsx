import React from 'react';
import { render } from '@testing-library/react-native';
import { TextureModule } from './TextureModule';

jest.mock('../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'grain',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../../model/useStylesStore', () => ({
  useStylesStore: jest.fn((fn?: (state: { grainIntensity: { value: number }; setGrainIntensity: jest.Mock; noiseReductionAuto: { value: boolean }; setNoiseReductionAuto: jest.Mock; noiseReductionMode: { value: number }; setNoiseReductionMode: jest.Mock; sharpening: { value: number }; setSharpening: jest.Mock }) => unknown) => {
    const state = {
      grainIntensity: { value: 0.5 },
      setGrainIntensity: jest.fn(),
      noiseReductionAuto: { value: true },
      setNoiseReductionAuto: jest.fn(),
      noiseReductionMode: { value: 1 },
      setNoiseReductionMode: jest.fn(),
      sharpening: { value: 0 },
      setSharpening: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../components/ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

interface MockControlInstance {
  props: {
    label: string;
    onPress: () => void;
  };
}

describe('TextureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<TextureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('passes handlePressWithDouble to Grain control', () => {
    const { UNSAFE_getAllByType } = render(<TextureModule {...mockProps} />);
    const controls = UNSAFE_getAllByType('ParameterControl' as unknown as React.ComponentType);
    const grainControl = controls.find((c) => (c as unknown as MockControlInstance).props.label === 'parameters.grain') as unknown as MockControlInstance | undefined;
    
    expect(grainControl).toBeDefined();
    grainControl!.props.onPress();
    expect(mockProps.handlePressWithDouble).toHaveBeenCalledWith('grain', expect.any(Function));
  });
});
