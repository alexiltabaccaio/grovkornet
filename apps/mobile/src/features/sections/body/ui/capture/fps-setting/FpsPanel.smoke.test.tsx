import React from 'react';
import { render } from '@testing-library/react-native';
import { FpsPanel } from './FpsPanel';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { fpsSetting: { value: number }; setFpsSetting: jest.Mock; capabilities: { maxFps: number } }) => unknown) => {
    const state = {
      fpsSetting: { value: 24 },
      setFpsSetting: jest.fn(),
      capabilities: { maxFps: 60 },
    };
    return fn ? fn(state) : state;
  }),
}));

describe('FpsPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<FpsPanel />);
    expect(toJSON()).toBeDefined();
  });
});
