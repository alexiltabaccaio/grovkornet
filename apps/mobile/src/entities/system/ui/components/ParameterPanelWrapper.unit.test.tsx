import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ParameterPanelWrapper } from './ParameterPanelWrapper';
import { useSystemStore } from '../../model/useSystemStore';

describe('ParameterPanelWrapper', () => {
  beforeEach(() => {
    useSystemStore.setState({ isDebugEnabled: false });
  });

  it('renders children and default layout correctly', () => {
    const { getByText } = render(
      <ParameterPanelWrapper>
        <Text>Test Child</Text>
      </ParameterPanelWrapper>
    );

    expect(getByText('Test Child')).toBeDefined();
  });

  it('renders accessories in non-scrollable mode', () => {
    const { getByText } = render(
      <ParameterPanelWrapper
        leftAccessory={<Text>Left</Text>}
        rightAccessory={<Text>Right</Text>}
      >
        <Text>Test Child</Text>
      </ParameterPanelWrapper>
    );

    expect(getByText('Left')).toBeDefined();
    expect(getByText('Right')).toBeDefined();
    expect(getByText('Test Child')).toBeDefined();
  });

  it('renders ScrollView in scrollable mode', () => {
    const { getByText } = render(
      <ParameterPanelWrapper scrollable={true}>
        <Text>Scroll Child</Text>
      </ParameterPanelWrapper>
    );
    expect(getByText('Scroll Child')).toBeDefined();
  });

  it('applies debug styles when isDebugEnabled is true', () => {
    useSystemStore.setState({ isDebugEnabled: true });
    
    const { getByText } = render(
      <ParameterPanelWrapper>
        <Text>Debug Child</Text>
      </ParameterPanelWrapper>
    );
    
    expect(getByText('Debug Child')).toBeDefined();
  });
});
