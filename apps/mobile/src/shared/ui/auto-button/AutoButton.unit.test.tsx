import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AutoButton } from './AutoButton';

describe('AutoButton Unit Tests', () => {
  it('renders correctly with default state', () => {
    const { getByText } = render(
      <AutoButton isActive={false} onPress={() => {}} />
    );
    expect(getByText('A')).toBeDefined();
  });

  it('triggers onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AutoButton isActive={false} onPress={onPressMock} />
    );
    fireEvent.press(getByText('A'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('handles shared value for isActive', () => {
    const isActiveShared = { value: true } as any;
    const { getByText } = render(
      <AutoButton isActive={isActiveShared} onPress={() => {}} />
    );
    expect(getByText('A')).toBeDefined();
  });
});
