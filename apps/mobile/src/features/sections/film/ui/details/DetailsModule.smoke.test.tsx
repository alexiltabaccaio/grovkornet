import React from 'react';
import { render } from '@testing-library/react-native';
import { DetailsModule } from './DetailsModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


describe('DetailsModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<DetailsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
