import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BrandingOverlay from './BrandingOverlay';

describe('BrandingOverlay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children correctly', () => {
    render(
      <BrandingOverlay>
        <div data-testid="child">Test Child</div>
      </BrandingOverlay>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('renders watermark', () => {
    render(
      <BrandingOverlay>
        <div>Test</div>
      </BrandingOverlay>
    );
    expect(screen.getByText(/alexgiustizieri/)).toBeDefined();
  });
});
