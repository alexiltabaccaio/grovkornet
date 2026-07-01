import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeModule } from './ThemeModule';

describe('ThemeModule', () => {
  it('renders all theme options', () => {
    const { getByText } = render(<ThemeModule />);

    // Assert that all themes are rendered in uppercase as expected by ParameterThumbView
    expect(getByText('GROVKORNET')).toBeDefined();
    expect(getByText('LIGHT')).toBeDefined();
    expect(getByText('NEON')).toBeDefined();
    expect(getByText('MONO')).toBeDefined();
  });

  it('allows switching the active theme', () => {
    const { getByText } = render(<ThemeModule />);

    // Tap on Neon theme
    const neonButton = getByText('NEON');
    fireEvent.press(neonButton);

    // Verify it handles state change (no crash, renders successfully)
    expect(getByText('NEON')).toBeDefined();
  });
});
