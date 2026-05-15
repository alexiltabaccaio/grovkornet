import React from 'react';
import { render } from '@testing-library/react-native';
import { GrainModule } from './GrainModule';
import { PrimaryParameterType } from '@shared/types/camera';

jest.mock('../PrimaryParameterControl', () => ({
  PrimaryParameterControl: 'PrimaryParameterControl',
}));

describe('GrainModule', () => {
  const mockProps = {
    activePrimaryParameter: 'grain' as PrimaryParameterType,
    setActivePrimaryParameter: jest.fn(),
    grainIntensity: { value: 0.5 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setGrainIntensity: jest.fn(),
    grainChroma: { value: 0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setGrainChroma: jest.fn(),
    grainSize: { value: 1.0 } as unknown as import('react-native-reanimated').SharedValue<number>,
    setGrainSize: jest.fn(),
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<GrainModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
