 
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GenericPillExtension } from './GenericPillExtension';

describe('GenericPillExtension', () => {
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const onChangeMock = jest.fn();
  const getLabelMock = (option: string) => option;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in static mode and handles presses', () => {
    const isActiveStaticMock = jest.fn((option) => option === 'Option 2');

    const { getByText } = render(
      <GenericPillExtension
        options={options}
        onChange={onChangeMock}
        getLabel={getLabelMock}
        isActiveStatic={isActiveStaticMock}
      />
    );

    expect(getByText('Option 1')).toBeDefined();
    expect(getByText('Option 2')).toBeDefined();
    expect(getByText('Option 3')).toBeDefined();

    // Verify static active resolver was called
    expect(isActiveStaticMock).toHaveBeenCalled();

    // Simulate pressing an option
    fireEvent.press(getByText('Option 1'));
    expect(onChangeMock).toHaveBeenCalledWith('Option 1', 0);
  });

  it('renders correctly in shared mode and handles presses', () => {
    const valueMock = { value: 1 };
    const isActiveSharedMock = jest.fn((currValue, option, index) => index === currValue);

    const { getByText } = render(
      <GenericPillExtension
        options={options}
        onChange={onChangeMock}
        getLabel={getLabelMock}
        value={valueMock as any}
        isActiveShared={isActiveSharedMock}
      />
    );

    expect(getByText('Option 1')).toBeDefined();

    // Simulate pressing an option
    fireEvent.press(getByText('Option 2'));
    expect(onChangeMock).toHaveBeenCalledWith('Option 2', 1);
  });

  it('renders left and right accessories, children, and supports scrollable/opacity styles', () => {
    const opacityFnMock = jest.fn(() => 0.5);

    const { getByText } = render(
      <GenericPillExtension
        options={options}
        onChange={onChangeMock}
        getLabel={getLabelMock}
        leftAccessory={<Text>Left Accessory</Text>}
        rightAccessory={<Text>Right Accessory</Text>}
        scrollable={true}
        opacity={opacityFnMock}
      >
        <Text>Inner Child</Text>
      </GenericPillExtension>
    );

    expect(getByText('Left Accessory')).toBeDefined();
    expect(getByText('Right Accessory')).toBeDefined();
    expect(getByText('Inner Child')).toBeDefined();
    expect(opacityFnMock).toHaveBeenCalled();
  });
});
