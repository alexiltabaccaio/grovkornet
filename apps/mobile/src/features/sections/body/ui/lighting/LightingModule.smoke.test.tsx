import React from 'react';
import { render } from '@testing-library/react-native';
import { LightingModule } from './LightingModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


jest.mock('@entities/body', () => ({
  useBodyStore: jest.fn((fn?: (state: { capabilities: { hasTorch: boolean } }) => unknown) => {
    const state = {
      capabilities: { hasTorch: true },
    };
    return fn ? fn(state) : state;
  }),
}));

describe('LightingModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly when torch is available', () => {
    const { toJSON } = render(<LightingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
