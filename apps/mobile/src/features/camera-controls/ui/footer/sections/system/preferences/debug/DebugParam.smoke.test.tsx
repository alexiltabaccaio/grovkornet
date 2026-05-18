import React from 'react';
import { render } from '@testing-library/react-native';
import { DebugParam } from './DebugParam';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../../../../model/useUIStore', () => ({
  useUIStore: jest.fn((fn?: (state: { isDebugEnabled: boolean; setIsDebugEnabled: jest.Mock }) => unknown) => {
    const state = {
      isDebugEnabled: false,
      setIsDebugEnabled: jest.fn(),
    };
    return fn ? fn(state) : state;
  }),
}));

jest.mock('../../../../ParameterControl', () => ({
  ParameterControl: 'ParameterControl',
}));

describe('DebugParam', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<DebugParam />);
    expect(toJSON()).toBeDefined();
  });
});
