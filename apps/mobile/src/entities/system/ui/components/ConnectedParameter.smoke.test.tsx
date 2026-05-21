import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectedParameter } from './ConnectedParameter';

jest.mock('@entities/system', () => ({
  useSystemStore: jest.fn((fn?: (state: { activeParameter: string; setActiveParameter: jest.Mock }) => unknown) => {
    const state = {
      activeParameter: 'contrast',
      setActiveParameter: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('./ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('ConnectedParameter', () => {
  const mockProps = {
    id: 'contrast' as const,
    label: 'Contrast',
    handlePressWithDouble: jest.fn(),
  };

  it('renders correctly', () => {
    const { toJSON } = render(<ConnectedParameter {...mockProps} />);
    expect(toJSON()).toBeDefined();
  });
});
