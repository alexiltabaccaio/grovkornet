import { renderHook } from '@testing-library/react-native';
import { useParameterGesture } from './useParameterGesture';
import { makeMutable } from 'react-native-reanimated';

describe('useParameterGesture', () => {
  it('creates only a tap gesture when variant is not slider', () => {
    const mockOnPress = jest.fn();
    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
      })
    );

    const combinedGesture = result.current.combinedGesture as any;
    expect(combinedGesture.type).toBeUndefined(); // It is just the tap gesture object

    // Trigger tap
    combinedGesture._onEnd();
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not trigger tap gesture when disabled', () => {
    const mockOnPress = jest.fn();
    const disabledVal = makeMutable(true);
    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        disabled: disabledVal,
      })
    );

    const combinedGesture = result.current.combinedGesture as any;
    combinedGesture._onEnd();
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('creates race gesture with tap and pan when variant is slider', () => {
    const mockOnPress = jest.fn();
    const mockOnChange = jest.fn();
    const mockOnUpdateWorklet = jest.fn();
    const valueVal = makeMutable(0.5);
    const trackWidthVal = makeMutable(200);

    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        onChange: mockOnChange,
        onUpdateWorklet: mockOnUpdateWorklet,
        value: valueVal,
        minValue: 0,
        maxValue: 1,
        variant: 'slider',
        sliderTrackWidth: trackWidthVal,
      })
    );

    const combinedGesture = result.current.combinedGesture as any;
    expect(combinedGesture.type).toBe('race');
    expect(combinedGesture.gestures).toHaveLength(2);

    const [tapGesture, panGesture] = combinedGesture.gestures;

    // Trigger tap gesture
    tapGesture._onEnd();
    expect(mockOnPress).toHaveBeenCalledTimes(1);

    // Trigger pan onStart (simulating a touch at x=140)
    // Formula inside panGesture.onStart:
    // trackStartX = 94. travel = trackWidthVal - 12 = 188.
    // percentage = (x - trackStartX) / travel = (140 - 94) / 188 = 46 / 188 = 0.244
    // newValue = minValue + percentage * range = 0.244
    panGesture._onStart({ x: 140 });
    expect(valueVal.value).toBeCloseTo(0.244, 2);
    expect(mockOnPress).toHaveBeenCalledTimes(2); // onPress called on pan start

    // Trigger pan onUpdate (dragging right)
    // dx = e.translationX - lastX. lastX starts at 0.
    // translationX = 50 -> dx = 50.
    // travel = 188. range = 1.0. delta = 50 / 188 = 0.265.
    // newValue = accumulatedValue + delta = 0.244 + 0.265 = 0.509
    panGesture._onUpdate({ translationX: 50 });
    expect(mockOnUpdateWorklet).toHaveBeenCalledWith(expect.any(Number));
    expect(mockOnUpdateWorklet.mock.calls[0][0]).toBeCloseTo(0.509, 2);

    // Trigger pan onEnd
    panGesture._onEnd();
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('handles slider drag update without custom onUpdateWorklet and with auto toggle', () => {
    const mockOnPress = jest.fn();
    const valueVal = makeMutable(0.5);
    const autoVal = makeMutable(true);
    const trackWidthVal = makeMutable(200);

    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        value: valueVal,
        isAuto: autoVal,
        minValue: 0,
        maxValue: 1,
        variant: 'slider',
        sliderTrackWidth: trackWidthVal,
      })
    );

    const [, panGesture] = (result.current.combinedGesture as any).gestures;

    // Trigger start at 144 (exact center travel = 94 + 94 = 188)
    panGesture._onStart({ x: 188 });
    expect(valueVal.value).toBe(0.5);

    // Trigger update (dx = 30 -> delta = 30 / 188 = 0.159 -> newValue = 0.659)
    panGesture._onUpdate({ translationX: 30 });
    expect(valueVal.value).toBeCloseTo(0.659, 2);
    expect(autoVal.value).toBe(false); // auto mode should be turned off on manual adjustment
  });

  it('supports hiding auto placeholder in slider start calculation', () => {
    const mockOnPress = jest.fn();
    const valueVal = makeMutable(0.5);
    const trackWidthVal = makeMutable(200);

    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        value: valueVal,
        minValue: 0,
        maxValue: 1,
        variant: 'slider',
        hideAutoPlaceholder: true,
        sliderTrackWidth: trackWidthVal,
      })
    );

    const [, panGesture] = (result.current.combinedGesture as any).gestures;

    // trackStartX = 8 since hideAutoPlaceholder is true
    // travel = 188
    // touch x = 102 -> percentage = (102 - 8) / 188 = 94 / 188 = 0.5
    panGesture._onStart({ x: 102 });
    expect(valueVal.value).toBe(0.5);
  });

  it('respects invertDrag for pan updates', () => {
    const mockOnPress = jest.fn();
    const valueVal = makeMutable(0.5);
    const trackWidthVal = makeMutable(200);

    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        value: valueVal,
        minValue: 0,
        maxValue: 1,
        variant: 'slider',
        invertDrag: true,
        sliderTrackWidth: trackWidthVal,
      })
    );

    const [, panGesture] = (result.current.combinedGesture as any).gestures;

    panGesture._onStart({ x: 188 });
    // dx = 30 -> delta = -30 / 188 = -0.159 (due to invertDrag) -> newValue = 0.341
    panGesture._onUpdate({ translationX: 30 });
    expect(valueVal.value).toBeCloseTo(0.341, 2);
  });
});
