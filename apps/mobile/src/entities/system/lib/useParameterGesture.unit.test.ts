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

    const labelGesture = result.current.labelGesture as any;
    expect(labelGesture.type).toBeUndefined(); // It is just the tap gesture object

    // Trigger tap
    labelGesture._onEnd();
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

    const labelGesture = result.current.labelGesture as any;
    labelGesture._onEnd();
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('creates race gesture with tap and pan when variant is slider', () => {
    const mockOnPress = jest.fn();
    const mockOnChange = jest.fn();
    const mockOnUpdateWorklet = Object.assign(jest.fn(), { __workletHash: 1 });
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

    const trackGesture = result.current.trackGesture as any;
    expect(trackGesture.type).toBe('race');
    expect(trackGesture.gestures).toHaveLength(2);

    const [tapGesture, panGesture] = trackGesture.gestures;

    // Trigger tap gesture
    tapGesture._onEnd();
    expect(mockOnPress).toHaveBeenCalledTimes(1);

    // Trigger pan onStart (simulating a touch at x=140)
    panGesture._onStart({ x: 140 });
    expect(valueVal.value).toBeCloseTo(0.244, 2);
    expect(mockOnPress).toHaveBeenCalledTimes(2); // onPress called on pan start

    // Trigger pan onUpdate (dragging right)
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

    const [, panGesture] = (result.current.trackGesture as any).gestures;

    // Trigger start at 188
    panGesture._onStart({ x: 188 });
    expect(valueVal.value).toBe(0.5);

    // Trigger update
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

    const [, panGesture] = (result.current.trackGesture as any).gestures;

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

    const [, panGesture] = (result.current.trackGesture as any).gestures;

    panGesture._onStart({ x: 188 });
    panGesture._onUpdate({ translationX: 30 });
    expect(valueVal.value).toBeCloseTo(0.341, 2);
  });

  describe('Slider Edge Cases', () => {
    it('returns early onStart/onUpdate/onEnd when gesture is disabled', () => {
      const mockOnPress = jest.fn();
      const mockOnChange = jest.fn();
      const valueVal = makeMutable(0.5);
      const disabledVal = makeMutable(true);

      const { result } = renderHook(() =>
        useParameterGesture({
          isActive: true,
          onPress: mockOnPress,
          onChange: mockOnChange,
          value: valueVal,
          disabled: disabledVal,
          variant: 'slider',
        })
      );

      const [, panGesture] = (result.current.trackGesture as any).gestures;

      panGesture._onStart({ x: 100 });
      expect(valueVal.value).toBe(0.5); // unchanged

      panGesture._onUpdate({ translationX: 20 });
      expect(valueVal.value).toBe(0.5); // unchanged

      panGesture._onEnd();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('returns early onStart/onUpdate if value is undefined', () => {
      const mockOnPress = jest.fn();
      const disabledVal = makeMutable(false);

      const { result } = renderHook(() =>
        useParameterGesture({
          isActive: true,
          onPress: mockOnPress,
          disabled: disabledVal,
          variant: 'slider',
        })
      );

      const [, panGesture] = (result.current.trackGesture as any).gestures;

      // Should not throw
      expect(() => {
        panGesture._onStart({ x: 100 });
        panGesture._onUpdate({ translationX: 20 });
      }).not.toThrow();
    });

    it('returns early onUpdate if the new value is identical to the current value', () => {
      const mockOnPress = jest.fn();
      const valueVal = makeMutable(0.5);
      const trackWidthVal = makeMutable(200);

      const { result } = renderHook(() =>
        useParameterGesture({
          isActive: true,
          onPress: mockOnPress,
          value: valueVal,
          variant: 'slider',
          sliderTrackWidth: trackWidthVal,
        })
      );

      const [, panGesture] = (result.current.trackGesture as any).gestures;

      panGesture._onStart({ x: 188 }); // Sets value to 0.5
      expect(valueVal.value).toBe(0.5);

      // Drag by 0 translation (delta = 0), value remains 0.5
      panGesture._onUpdate({ translationX: 0 });
      expect(valueVal.value).toBe(0.5);
    });

    it('does not call onChange onEnd if onChange is undefined', () => {
      const mockOnPress = jest.fn();
      const valueVal = makeMutable(0.5);

      const { result } = renderHook(() =>
        useParameterGesture({
          isActive: true,
          onPress: mockOnPress,
          value: valueVal,
          variant: 'slider',
        })
      );

      const [, panGesture] = (result.current.trackGesture as any).gestures;
      
      expect(() => {
        panGesture._onEnd();
      }).not.toThrow();
    });
  });

  it('distinguishes between track DoubleTap (onReset) and label DoubleTap (onResetGroup)', () => {
    const mockOnPress = jest.fn();
    const mockOnReset = jest.fn();
    const mockOnResetGroup = jest.fn();

    const { result } = renderHook(() =>
      useParameterGesture({
        isActive: true,
        onPress: mockOnPress,
        onReset: mockOnReset,
        onResetGroup: mockOnResetGroup,
      })
    );

    const trackGesture = result.current.trackGesture as any;
    const labelGesture = result.current.labelGesture as any;

    expect(trackGesture.type).toBe('exclusive');
    expect(labelGesture.type).toBe('exclusive');

    const [trackDoubleTap] = trackGesture.gestures;
    const [labelDoubleTap] = labelGesture.gestures;

    trackDoubleTap._onEnd();
    expect(mockOnReset).toHaveBeenCalledTimes(1);
    expect(mockOnResetGroup).not.toHaveBeenCalled();

    labelDoubleTap._onEnd();
    expect(mockOnResetGroup).toHaveBeenCalledTimes(1);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
