import React from 'react';
import { render } from '@testing-library/react-native';
import { ExposureModule } from './ExposureModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

describe('ExposureModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ExposureModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
