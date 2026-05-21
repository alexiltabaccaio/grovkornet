import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugOverlay } from './DebugOverlay';

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((selector) => selector({
    fps: { value: 60 },
    hwFps: { value: 60 },
    resolution: { value: '1080p' },
  })),
}));

describe('DebugOverlay Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<DebugOverlay />);
    expect(toJSON()).toBeDefined();
  });
});
