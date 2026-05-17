import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { GestureController } from './GestureController';
import { useUIStore } from '../model/useUIStore';

// Mock the stores
jest.mock('../model/useUIStore');

describe('GestureController', () => {
  const _mockUIStore = {
    gestureConfig: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUIStore as unknown as jest.Mock).mockImplementation((selector?: (state: { gestureConfig: unknown }) => unknown) => {
      const state = {
        gestureConfig: null,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should render children even when gestureConfig is null', () => {
    const { getByTestId } = render(
      <GestureController>
        <View testID="test-child" />
      </GestureController>
    );
    expect(getByTestId('test-child')).toBeDefined();
  });

  it('should render correctly when gestureConfig is provided', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector?: (state: { gestureConfig: unknown }) => unknown) => {
      const state = {
        gestureConfig: {
          value: { value: 0.5 },
          minValue: 0,
          maxValue: 1,
        },
      };
      return selector ? selector(state) : state;
    });

    const { getByTestId } = render(
      <GestureController>
        <View testID="test-child" />
      </GestureController>
    );
    expect(getByTestId('test-child')).toBeDefined();
  });
});
