import React from 'react';
import { render } from '@testing-library/react-native';
import { FpsExtension } from './FpsExtension';

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { fpsSetting: { value: number }; setFpsSetting: jest.Mock; capabilities: { maxFps: number } }) => unknown) => {
    const state = {
      fpsSetting: { value: 24 },
      setFpsSetting: jest.fn(),
      capabilities: { maxFps: 60 },
    };
    return fn ? fn(state) : state;
  }),
}));

describe('FpsExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<FpsExtension />);
    expect(toJSON()).toBeDefined();
  });
});
