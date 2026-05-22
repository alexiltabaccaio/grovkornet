import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PillButton } from './PillButton';

describe('PillButton Unit Tests', () => {
  it('renders label correctly', () => {
    const { getByText } = render(
      <PillButton label="Test Label" isActive={false} onPress={() => {}} />
    );
    expect(getByText('Test Label')).toBeDefined();
  });

  it('triggers onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PillButton label="Press Me" isActive={false} onPress={onPressMock} />
    );
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders correct variant without crashing', () => {
    const { getByText } = render(
      <>
        <PillButton label="Default" isActive={true} onPress={() => {}} variant="default" />
        <PillButton label="Auto" isActive={true} onPress={() => {}} variant="auto" />
        <PillButton label="Module" isActive={true} onPress={() => {}} variant="module" />
      </>
    );
    expect(getByText('Default')).toBeDefined();
    expect(getByText('Auto')).toBeDefined();
    expect(getByText('Module')).toBeDefined();
  });

  it('handles shared value for isActive', () => {
    const isActiveShared = { value: true } as any;
    const { getByText } = render(
      <PillButton label="Shared" isActive={isActiveShared} onPress={() => {}} />
    );
    expect(getByText('Shared')).toBeDefined();
  });
});
