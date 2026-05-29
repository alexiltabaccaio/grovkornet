import React from 'react';
import { render } from '@testing-library/react-native';
import { ToneModule } from './ToneModule';

jest.mock('@entities/system', () => ({
  ...jest.requireActual('@entities/system'),
  GenericParameterModule: 'GenericParameterModule',
}));

describe('ToneModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ToneModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
