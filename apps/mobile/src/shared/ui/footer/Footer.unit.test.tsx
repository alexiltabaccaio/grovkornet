import React from 'react';
import { render } from '@testing-library/react-native';
import { Footer } from './Footer';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Override the global mock of react-native-safe-area-context to allow dynamic return values
jest.mock('react-native-safe-area-context', () => {
  return {
    useSafeAreaInsets: jest.fn(),
  };
});

describe('Footer Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });
    
    const { getByText } = render(
      <Footer>
        <Text>Test Content</Text>
      </Footer>
    );

    expect(getByText('Test Content')).toBeDefined();
  });

  it('applies default height and zero padding when bottom inset is 0', () => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });

    const { getByTestId } = render(
      <Footer>
        <Text>Content</Text>
      </Footer>
    );

    const container = getByTestId('footer-container');
    const flatStyle = Object.assign({}, ...container.props.style);

    expect(flatStyle.height).toBe(80);
    expect(flatStyle.paddingBottom).toBe(0);
  });

  it('applies correct height and padding when bottom inset is positive', () => {
    const bottomInset = 34;
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, right: 0, bottom: bottomInset, left: 0 });

    const { getByTestId } = render(
      <Footer>
        <Text>Content</Text>
      </Footer>
    );

    const container = getByTestId('footer-container');
    const flatStyle = Object.assign({}, ...container.props.style);

    expect(flatStyle.height).toBe(80 + bottomInset);
    expect(flatStyle.paddingBottom).toBe(bottomInset);
  });

  it('merges external style correctly', () => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });

    const { getByTestId } = render(
      <Footer style={{ opacity: 0.5 }}>
        <Text>Content</Text>
      </Footer>
    );

    const container = getByTestId('footer-container');
    const flatStyle = Object.assign({}, ...container.props.style);

    expect(flatStyle.opacity).toBe(0.5);
    expect(flatStyle.height).toBe(80);
  });
});
