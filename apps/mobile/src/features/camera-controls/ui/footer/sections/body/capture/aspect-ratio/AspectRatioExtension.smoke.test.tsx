import React from 'react';
import { render } from '@testing-library/react-native';
import { AspectRatioExtension } from './AspectRatioExtension';

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { aspectRatio: { value: number }; setAspectRatio: jest.Mock }) => unknown) => {
    const state = {
      aspectRatio: { value: 0 },
      setAspectRatio: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('AspectRatioExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AspectRatioExtension />);
    expect(toJSON()).toBeDefined();
  });
});
