import { updateSharedValue } from './safeUpdate';
import { makeMutable } from 'react-native-reanimated';

describe('updateSharedValue', () => {
  it('updates number shared value successfully', () => {
    const sv = makeMutable(10);
    updateSharedValue(sv, 20);
    expect(sv.value).toBe(20);
  });

  it('updates boolean shared value successfully', () => {
    const sv = makeMutable(true);
    updateSharedValue(sv, false);
    expect(sv.value).toBe(false);
  });

  it('returns early if shared value is undefined', () => {
    expect(() => {
      updateSharedValue(undefined, 20);
    }).not.toThrow();
  });

  it('does not update if type is mismatched', () => {
    const sv = makeMutable(10);
    updateSharedValue(sv, false);
    expect(sv.value).toBe(10); // Unchanged

    const svBool = makeMutable(true);
    updateSharedValue(svBool, 20);
    expect(svBool.value).toBe(true); // Unchanged
  });
});
