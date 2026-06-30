import React from 'react';
import { render } from '@testing-library/react-native';
import { ColorModule } from './ColorModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


describe('ColorModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ColorModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
