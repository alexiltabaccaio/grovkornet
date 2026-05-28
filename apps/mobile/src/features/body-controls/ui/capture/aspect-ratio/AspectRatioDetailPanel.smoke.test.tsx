import React from 'react';
import { render } from '@testing-library/react-native';
import { AspectRatioDetailPanel } from './AspectRatioDetailPanel';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { 
    aspectRatio: { value: number }; 
    setAspectRatio: jest.Mock;
    resolutionSetting: { value: number };
    force4k60fpsCrop: { value: number };
    setForce4k60fpsCrop: jest.Mock;
  }) => unknown) => {
    const state = {
      aspectRatio: { value: 0 },
      setAspectRatio: jest.fn(),
      resolutionSetting: { value: 1 },
      force4k60fpsCrop: { value: 1 },
      setForce4k60fpsCrop: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('AspectRatioDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AspectRatioDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
