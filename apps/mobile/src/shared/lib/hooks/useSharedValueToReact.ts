import { useState } from 'react';
import { runOnJS, SharedValue, useAnimatedReaction } from 'react-native-reanimated';

export function useSharedValueToReact<T>(sharedValue: SharedValue<T>): T {
  const [state, setState] = useState(sharedValue.value);

  useAnimatedReaction(
    () => sharedValue.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setState)(currentValue);
      }
    },
    [sharedValue]
  );

  return state;
}
