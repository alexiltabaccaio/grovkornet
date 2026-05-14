import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainModule } from './GrainModule';
import { ParameterType } from '@shared/types/camera';

jest.mock('../FooterParameterControl', () => ({
  FooterParameterControl: 'FooterParameterControl',
}));

describe('GrainModule', () => {
  const mockProps = {
    activeParameter: 'grain' as ParameterType,
    setActiveParameter: jest.fn(),
    grainIntensity: { value: 0.5 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setGrainIntensity: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<GrainModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
