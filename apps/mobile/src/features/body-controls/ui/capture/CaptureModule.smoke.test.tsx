import React from 'react';
import { render } from '@testing-library/react-native';
import { CaptureModule } from './CaptureModule';

jest.mock('@entities/system', () => ({
  ...jest.requireActual('@entities/system'),
  GenericParameterModule: 'GenericParameterModule',
}));

describe('CaptureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<CaptureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
