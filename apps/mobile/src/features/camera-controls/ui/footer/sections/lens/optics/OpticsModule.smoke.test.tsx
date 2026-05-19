import React from 'react';
import { render } from '@testing-library/react-native';
import { OpticsModule } from './OpticsModule';

jest.mock('../../../components/ConnectedParameter', () => ({
  ConnectedParameter: 'ConnectedParameter',
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
