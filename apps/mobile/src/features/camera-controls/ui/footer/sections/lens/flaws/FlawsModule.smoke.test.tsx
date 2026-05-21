import React from 'react';
import { render } from '@testing-library/react-native';
import { FlawsModule } from './FlawsModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

describe('FlawsModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<FlawsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
