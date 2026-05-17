import { SharedValue } from 'react-native-reanimated';

/**
 * A safe way to update a SharedValue from a worklet while satisfying ESLint rules.
 * This encapsulates the mutation, providing a clear API for LLMs.
 */
export const updateSharedValue = (sv: SharedValue<number> | SharedValue<boolean> | undefined, newValue: number | boolean) => {
  'worklet';
  if (!sv) return;
  
  if (typeof newValue === 'number' && typeof sv.value === 'number') {
    sv.value = newValue;
  } else if (typeof newValue === 'boolean' && typeof sv.value === 'boolean') {
    sv.value = newValue;
  }
};
