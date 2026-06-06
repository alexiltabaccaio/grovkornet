import React from 'react';
import { render } from '@testing-library/react-native';
import { ResolutionPanel } from './ResolutionPanel';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { resolutionSetting: { value: number }; setResolutionSetting: jest.Mock; previewQuality: { value: number }; setPreviewQuality: jest.Mock }) => unknown) => {
    const state = {
      resolutionSetting: { value: 0 },
      setResolutionSetting: jest.fn(),
      previewQuality: { value: 1 },
      setPreviewQuality: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('ResolutionPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ResolutionPanel />);
    expect(toJSON()).toBeDefined();
  });
});
