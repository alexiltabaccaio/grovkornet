import React from 'react';
import { render } from '@testing-library/react-native';
import { GestureController } from './GestureController';
import { useUIStore } from '../model/useUIStore';

// Mock the stores
jest.mock('../model/useUIStore');

describe('GestureController', () => {
  const mockUIStore = {
    gestureConfig: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        gestureConfig: null,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should render null when gestureConfig is null', () => {
    const { toJSON } = render(<GestureController />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly when gestureConfig is provided', () => {
    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        gestureConfig: {
          value: { value: 0.5 },
          minValue: 0,
          maxValue: 1,
        },
      };
      return selector ? selector(state) : state;
    });

    const { toJSON } = render(<GestureController />);
    expect(toJSON()).not.toBeNull();
  });
});
