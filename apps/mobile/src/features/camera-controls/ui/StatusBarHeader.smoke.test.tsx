import React from 'react';
import { render } from '@testing-library/react-native';
import { useUIStore } from '@features/camera-controls/model/useUIStore';
import { StatusBarHeader } from './StatusBarHeader';

// Mock the store module
jest.mock('@features/camera-controls/model/useUIStore', () => ({
  useUIStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => 
    selector({
      isDebugEnabled: false,
    })
  ),
}));

describe('StatusBarHeader Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON, queryByText } = render(<StatusBarHeader />);
    expect(toJSON()).toBeDefined();
    expect(queryByText(/STATUS BAR/)).toBeNull();
  });

  it('shows debug text when debug is enabled', () => {
    const mockUIStore = useUIStore as unknown as jest.Mock;
    mockUIStore.mockImplementationOnce((selector: (state: Record<string, unknown>) => unknown) => 
      selector({
        isDebugEnabled: true,
      })
    );

    const { toJSON, getByText } = render(<StatusBarHeader />);
    expect(toJSON()).toBeDefined();
    expect(getByText(/STATUS BAR/)).toBeDefined();
  });
});
