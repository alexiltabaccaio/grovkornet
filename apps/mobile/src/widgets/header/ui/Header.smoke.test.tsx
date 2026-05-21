import React from 'react';
import { render } from '@testing-library/react-native';
import { useSystemStore } from '@entities/system';
import { Header } from './Header';

// Mock the store module
jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => 
    selector({
      isDebugEnabled: false,
    })
  ),
}));

describe('Header Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON, queryByText } = render(<Header />);
    expect(toJSON()).toBeDefined();
    expect(queryByText(/STATUS BAR/)).toBeNull();
  });

  it('does not show debug text even when debug is enabled', () => {
    const mockSystemStore = useSystemStore as unknown as jest.Mock;
    mockSystemStore.mockImplementationOnce((selector: (state: Record<string, unknown>) => unknown) => 
      selector({
        isDebugEnabled: true,
      })
    );

    const { toJSON, queryByText } = render(<Header />);
    expect(toJSON()).toBeDefined();
    expect(queryByText(/STATUS BAR/)).toBeNull();
  });
});
