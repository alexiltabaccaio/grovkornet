import React from 'react';
import { render } from '@testing-library/react-native';
import { TextureModule } from './TextureModule';

jest.mock('@features/system-controls', () => ({
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
