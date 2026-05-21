import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { GestureController } from './GestureController';
import { useSystemStore } from '@entities/system';

// Mock the stores
jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn(),
}));

describe('GestureController', () => {
  const mockSetActiveSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSystemStore as unknown as jest.Mock).mockImplementation((selector?: (state: any) => any) => {
      const state = {
        activeSection: 'none',
        setActiveSection: mockSetActiveSection,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <GestureController>
        <View testID="test-child" />
      </GestureController>
    );
    expect(getByTestId('test-child')).toBeDefined();
  });
});
