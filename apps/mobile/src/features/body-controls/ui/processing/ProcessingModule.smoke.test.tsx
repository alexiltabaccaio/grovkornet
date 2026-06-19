import React from 'react';
import { render } from '@testing-library/react-native';
import { ProcessingModule } from './ProcessingModule';

jest.mock('@features/system-controls', () => ({
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
