import React from 'react';
import { render } from '@testing-library/react-native';
import { AspectRatioPanel } from './AspectRatioPanel';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { 
    aspectRatio: { value: number }; 
    setAspectRatio: jest.Mock;
    resolutionSetting: { value: number };
    force60fpsCrop: { value: number };
    setForce60fpsCrop: jest.Mock;
  }) => unknown) => {
    const state = {
      aspectRatio: { value: 0 },
      setAspectRatio: jest.fn(),
      resolutionSetting: { value: 1 },
      force60fpsCrop: { value: 1 },
      setForce60fpsCrop: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('AspectRatioPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AspectRatioPanel />);
    expect(toJSON()).toBeDefined();
  });
});
