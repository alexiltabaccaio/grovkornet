/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectedParameter } from './ConnectedParameter';

const mockSetActiveParameter = jest.fn();

jest.mock('../../model/useSystemStore', () => ({
  useSystemStore: jest.fn((fn?: (state: any) => unknown) => {
    const state = {
      activeParameter: 'contrast',
      setActiveParameter: mockSetActiveParameter,
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('./ParameterControl', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    ParameterControl: (props: any) => (
      <TouchableOpacity testID="ParameterControl" onPress={props.onPress} />
    ),
  };
});

describe('ConnectedParameter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and handles default press without double-press handler', () => {
    const { getByTestId } = render(
      <ConnectedParameter id="contrast" label="Contrast" />
    );

    fireEvent.press(getByTestId('ParameterControl'));

    expect(mockSetActiveParameter).toHaveBeenCalledWith('contrast');
  });

  it('handles press with double-press handler correctly', () => {
    const handlePressWithDoubleMock = jest.fn((param, callback) => {
      // Simulate double-press handler executing the callback
      callback();
    });

    const { getByTestId } = render(
      <ConnectedParameter
        id="contrast"
        label="Contrast"
        handlePressWithDouble={handlePressWithDoubleMock}
      />
    );

    fireEvent.press(getByTestId('ParameterControl'));

    expect(handlePressWithDoubleMock).toHaveBeenCalled();
    expect(mockSetActiveParameter).toHaveBeenCalledWith('contrast');
  });

  it('respects custom isActive and onPress overrides', () => {
    const customOnPress = jest.fn();
    const { getByTestId } = render(
      <ConnectedParameter
        id="contrast"
        label="Contrast"
        isActive={true}
        onPress={customOnPress}
      />
    );

    fireEvent.press(getByTestId('ParameterControl'));

    expect(customOnPress).toHaveBeenCalled();
    expect(mockSetActiveParameter).not.toHaveBeenCalled();
  });
});
