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
    value: { value: 100 } as unknown as import('react-native-reanimated').SharedValue<number>,
    variant: 'text' as const,
  };

  it('renders correctly without value prop in AnimatedTextInput', () => {
    const { toJSON } = render(<ParameterControl {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
