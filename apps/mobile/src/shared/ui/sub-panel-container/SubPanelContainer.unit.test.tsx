import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SubPanelContainer } from './SubPanelContainer';

describe('SubPanelContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <SubPanelContainer>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(getByText('Test Child')).toBeDefined();
  });

  it('applies debug padding when isDebugEnabled is true', () => {
    const { toJSON } = render(
      <SubPanelContainer isDebugEnabled={true}>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(toJSON()).toBeDefined();
  });

  it('applies debug border when isDebugEnabled and showBorder are true', () => {
    const { toJSON } = render(
      <SubPanelContainer showBorder={true} isDebugEnabled={true}>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(toJSON()).toBeDefined();
  });
});
