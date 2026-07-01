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

  it('renders customized thumbnailComponent when provided in preset variant', () => {
    const { View } = require('react-native');
    const { getByTestId } = render(
      <ParameterThumbView
        label="Custom Preset"
        isActive={true}
        variant="preset"
        thumbnailComponent={<View testID="custom-thumbnail" />}
      />
    );
    expect(getByTestId('custom-thumbnail')).toBeDefined();
  });
});
