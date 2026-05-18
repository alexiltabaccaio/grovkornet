import React from 'react';
import { render } from '@testing-library/react-native';
import { ParameterThumbView } from './ParameterThumbView';

describe('ParameterThumbView', () => {
  const mockProps = {
    label: 'ISO',
    isActive: true,
    value: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    variant: 'text' as const,
  };

  it('renders correctly', () => {
    const { toJSON, getByText } = render(<ParameterThumbView {...mockProps} />);
    expect(toJSON()).toBeDefined();
    expect(getByText('ISO')).toBeDefined();
  });

  it('handles optional props without crashing', () => {
    const minProps = {
      label: 'TEST',
      isActive: false,
    };
    const { toJSON } = render(<ParameterThumbView {...minProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders square variant correctly', () => {
    const squareProps = {
      label: 'SQUARE',
      isActive: true,
      variant: 'square' as const,
      icon: 'sparkles-outline' as const,
    };
    const { toJSON, getByText } = render(<ParameterThumbView {...squareProps} />);
    expect(toJSON()).toBeDefined();
    expect(getByText('SQUARE')).toBeDefined();
  });
});
