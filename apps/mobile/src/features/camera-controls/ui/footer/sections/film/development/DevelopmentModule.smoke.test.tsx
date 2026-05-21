import React from 'react';
import { render } from '@testing-library/react-native';
import { DevelopmentModule } from './DevelopmentModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

describe('DevelopmentModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<DevelopmentModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
