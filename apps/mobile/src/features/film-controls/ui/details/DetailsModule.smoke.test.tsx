import React from 'react';
import { render } from '@testing-library/react-native';
import { DetailsModule } from './DetailsModule';

jest.mock('@features/system-controls', () => ({
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
