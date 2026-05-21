import React from 'react';
import { render } from '@testing-library/react-native';
import { OpticsModule } from './OpticsModule';

jest.mock('@entities/system', () => ({
  ...jest.requireActual('@entities/system'),
  GenericParameterModule: 'GenericParameterModule',
}));

jest.mock('@entities/lens', () => ({
  useLensStore: jest.fn((fn?: (state: { capabilities: { availableCameras: { id: string }[] } }) => unknown) => {
    const state = {
      capabilities: {
        availableCameras: [{ id: '1' }],
      },
    };
    return fn ? fn(state) : state;
  }),
}));

describe('OpticsModule', () => {
  const mockProps = {
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<OpticsModule {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
