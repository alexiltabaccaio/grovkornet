import React from 'react';
import { render } from '@testing-library/react-native';
import { PreferencesModule } from './PreferencesModule';

jest.mock('../../../components/ConnectedParameter', () => ({
  ConnectedParameter: 'ConnectedParameter',
}));

describe('PreferencesModule', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <PreferencesModule />
    );
    expect(toJSON()).toBeDefined();
  });
});
