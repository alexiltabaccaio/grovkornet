import React from 'react';
import { render } from '@testing-library/react-native';
import { ResolutionExtension } from './ResolutionExtension';

jest.mock('../../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { resolutionSetting: { value: number }; setResolutionSetting: jest.Mock }) => unknown) => {
    const state = {
      resolutionSetting: { value: 0 },
      setResolutionSetting: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('ResolutionExtension', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ResolutionExtension />);
    expect(toJSON()).toBeDefined();
  });
});
