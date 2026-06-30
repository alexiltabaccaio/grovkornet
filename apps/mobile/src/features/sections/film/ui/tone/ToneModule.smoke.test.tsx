import React from 'react';
import { render } from '@testing-library/react-native';
import { ToneModule } from './ToneModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
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
