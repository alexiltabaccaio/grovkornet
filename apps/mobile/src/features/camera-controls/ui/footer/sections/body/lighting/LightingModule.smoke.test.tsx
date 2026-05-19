import React from 'react';
import { render } from '@testing-library/react-native';
import { LightingModule } from './LightingModule';

jest.mock('../../../components/ConnectedParameter', () => ({
  ConnectedParameter: 'ConnectedParameter',
}));

describe('LightingModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<LightingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
