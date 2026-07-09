import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeWindow from './CodeWindow';

describe('CodeWindow Smoke Test', () => {
  it('renders code window with file name', () => {
    render(
      <CodeWindow
        code="const x = 42;"
        language="typescript"
        fileName="test.ts"
      />
    );
    expect(screen.getByText('test.ts')).toBeDefined();
  });
});
