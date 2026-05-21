import React from 'react';
import { render } from '@testing-library/react-native';
import { PreferencesModule } from './PreferencesModule';

jest.mock('../../../components/GenericParameterModule', () => ({
  GenericParameterModule: 'GenericParameterModule',
}));

describe('PreferencesModule', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<PreferencesModule />);
    expect(toJSON()).toBeDefined();
  });
});
