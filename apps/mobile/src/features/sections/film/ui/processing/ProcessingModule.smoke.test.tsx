import React from 'react';
import { render } from '@testing-library/react-native';
import { ProcessingModule } from './ProcessingModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


describe('ProcessingModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ProcessingModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
