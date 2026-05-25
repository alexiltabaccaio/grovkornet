import React from 'react';
import { render } from '@testing-library/react-native';
import { ResolutionDetailPanel } from './ResolutionDetailPanel';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { resolutionSetting: { value: number }; setResolutionSetting: jest.Mock; previewIn4k: { value: number }; setPreviewIn4k: jest.Mock }) => unknown) => {
    const state = {
      resolutionSetting: { value: 0 },
      setResolutionSetting: jest.fn(),
      previewIn4k: { value: 0 },
      setPreviewIn4k: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

describe('ResolutionDetailPanel', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ResolutionDetailPanel />);
    expect(toJSON()).toBeDefined();
  });
});
