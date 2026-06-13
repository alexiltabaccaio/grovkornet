import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { InteractionContext, useInteractionContext } from './InteractionContext';

const TestComponent = () => {
  const { isInteractable } = useInteractionContext();
  return <Text testID="is-interactable">{isInteractable ? 'yes' : 'no'}</Text>;
};

describe('InteractionContext', () => {
  it('provides the default value when no Provider wraps it', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('is-interactable').props.children).toBe('yes');
  });

  it('provides the current value when Provider wraps it', () => {
    const { getByTestId, rerender } = render(
      <InteractionContext.Provider value={{ isInteractable: false }}>
        <TestComponent />
      </InteractionContext.Provider>
    );
    expect(getByTestId('is-interactable').props.children).toBe('no');

    rerender(
      <InteractionContext.Provider value={{ isInteractable: true }}>
        <TestComponent />
      </InteractionContext.Provider>
    );
    expect(getByTestId('is-interactable').props.children).toBe('yes');
  });
});
