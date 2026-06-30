import React from 'react';
import { render } from '@testing-library/react-native';
import { ArtifactsModule } from './ArtifactsModule';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  GenericParameterModule: 'GenericParameterModule',
}));


describe('ArtifactsModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ArtifactsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
