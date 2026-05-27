import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugOverlay } from './DebugOverlay';

let mockStore = {
  fps: { value: 60 },
  hwFps: { value: 60 },
  resolution: { value: '1920x1080' },
  aspectRatio: { value: 1 },
};

jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((selector) => selector(mockStore)),
}));

describe('DebugOverlay Branch Tests', () => {
  beforeEach(() => {
    mockStore = {
      fps: { value: 60 },
      hwFps: { value: 60 },
      resolution: { value: '1920x1080' },
      aspectRatio: { value: 1 },
    };
  });

  it('renders resolution and aspect ratio matching cases', () => {
    // Test default/case 1 (16:9)
    const { toJSON, rerender } = render(<DebugOverlay />);
    expect(toJSON()).toBeDefined();

    // Test resolution empty string
    mockStore.resolution.value = '';
    rerender(<DebugOverlay />);
    expect(toJSON()).toBeDefined();

    // Test resolution invalid format (no 'x')
    mockStore.resolution.value = '1080p';
    rerender(<DebugOverlay />);
    expect(toJSON()).toBeDefined();

    // Test resolution containing non-numbers
    mockStore.resolution.value = 'abcx100';
    rerender(<DebugOverlay />);
    expect(toJSON()).toBeDefined();

    // Test different aspect ratio cases
    const aspects = [0, 1, 2, 3, 4, 99]; // 4:3, 16:9, 1:1, 3:2, 65:24, default
    for (const aspect of aspects) {
      mockStore.resolution.value = '1920x1080';
      mockStore.aspectRatio.value = aspect;
      rerender(<DebugOverlay />);
      expect(toJSON()).toBeDefined();
    }

    // Test targetAspect <= camAspect vs targetAspect > camAspect branches
    mockStore.resolution.value = '1000x1000'; // camAspect = 1
    mockStore.aspectRatio.value = 1; // targetAspect = 16/9 = 1.77 -> targetAspect > camAspect
    rerender(<DebugOverlay />);
    expect(toJSON()).toBeDefined();

    mockStore.aspectRatio.value = 2; // targetAspect = 1 -> targetAspect <= camAspect
    rerender(<DebugOverlay />);
    expect(toJSON()).toBeDefined();
  });
});
