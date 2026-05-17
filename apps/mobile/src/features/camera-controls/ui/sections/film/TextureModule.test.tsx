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

  it('passes grainIntensity to ParameterControl', () => {
    const { UNSAFE_getByType } = render(<TextureModule {...mockProps} />);
    const control = UNSAFE_getByType('ParameterControl' as any);
    expect(control.props.value).toEqual({ value: 0.5 });
  });
});
