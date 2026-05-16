import React from 'react';
import { render } from '@testing-library/react-native';
import { ParameterControl } from './ParameterControl';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));



describe('ParameterControl', () => {
  const mockProps = {
    label: 'ISO',
    isActive: true,
    onPress: jest.fn(),
    onChange: jest.fn(),
    value: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    variant: 'text' as const,
  };

  it('renders correctly', () => {
    const { toJSON, getByText } = render(<ParameterControl {...mockProps} />);
    expect(toJSON()).toBeDefined();
    expect(getByText('ISO')).toBeDefined();
  });

  it('handles optional props without crashing', () => {
    const minProps = {
      label: 'TEST',
      isActive: false,
      onPress: jest.fn(),
    };
    const { toJSON } = render(<ParameterControl {...minProps} />);
    expect(toJSON()).toBeDefined();
  });
});
