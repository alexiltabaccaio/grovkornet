import React from 'react';
import { render } from '@testing-library/react-native';
import { OpticsModule } from './OpticsModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

jest.mock('../../../../../model/useHardwareStore', () => ({
  useHardwareStore: jest.fn((fn?: (state: { capabilities: { availableCameras: { id: string }[] } }) => unknown) => {
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
