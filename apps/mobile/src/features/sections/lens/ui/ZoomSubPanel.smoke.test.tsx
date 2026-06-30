import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ZoomSubPanel } from './ZoomSubPanel';

const mockSetZoom = jest.fn();
const mockUpdateZoom = jest.fn();

jest.mock('@entities/body', () => ({
  useBodyStore: (fn: (state: any) => any) => {
    const state = {
      zoom: { value: 1.0 },
      setZoom: mockSetZoom,
      capabilities: { minZoom: 0.5, maxZoom: 5.0 },
    };
    return fn(state);
  },
  useBodyWorklets: () => ({
    updateZoom: mockUpdateZoom,
  }),
}));

jest.mock('@entities/system', () => ({
  useSystemStore: (fn: (state: any) => any) => {
    const state = {
      isLayoutOverlayEnabled: false,
    };
    return fn(state);
  },
}));

jest.mock('@shared/lib/haptics', () => ({
  selectionAsync: jest.fn(),
}));

describe('ZoomSubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with zoom options', () => {
    const { toJSON, getByText } = render(<ZoomSubPanel />);
    expect(toJSON()).toBeDefined();

    // Verify zoom options are rendered
    expect(getByText('0.5x')).toBeDefined();
    expect(getByText('1x')).toBeDefined();
    expect(getByText('2x')).toBeDefined();
    expect(getByText('3x')).toBeDefined();
    expect(getByText('5x')).toBeDefined();
  });

  it('handles zoom press and triggers state change', () => {
    const { getByText } = render(<ZoomSubPanel />);
    const btn = getByText('2x');
    fireEvent.press(btn);

    expect(mockSetZoom).toHaveBeenCalledWith(2.0);
    expect(mockUpdateZoom).toHaveBeenCalledWith(2.0);
  });
});
