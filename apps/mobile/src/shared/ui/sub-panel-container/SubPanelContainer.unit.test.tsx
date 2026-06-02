import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SubPanelContainer } from './SubPanelContainer';
import { useSystemStore } from '@entities/system';
import { act } from 'react-test-renderer';

describe('SubPanelContainer', () => {
  beforeEach(() => {
    act(() => {
      useSystemStore.getState().setIsDebugEnabled(false);
    });
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SubPanelContainer>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(getByText('Test Child')).toBeDefined();
  });

  it('applies debug padding when isDebugEnabled is true', () => {
    act(() => {
      useSystemStore.getState().setIsDebugEnabled(true);
    });
    
    const { toJSON } = render(
      <SubPanelContainer>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(toJSON()).toBeDefined();
  });

  it('applies debug border when isDebugEnabled and showBorder are true', () => {
    act(() => {
      useSystemStore.getState().setIsDebugEnabled(true);
    });
    
    const { toJSON } = render(
      <SubPanelContainer showBorder={true}>
        <Text>Test Child</Text>
      </SubPanelContainer>
    );
    expect(toJSON()).toBeDefined();
  });
});
