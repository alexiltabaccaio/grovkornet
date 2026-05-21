import React from 'react';
import { render } from '@testing-library/react-native';
import { TextureModule } from './TextureModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

describe('TextureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<TextureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
