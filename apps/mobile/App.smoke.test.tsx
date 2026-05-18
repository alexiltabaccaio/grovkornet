import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

// Mock Expo StatusBar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeDefined();
  });
});
