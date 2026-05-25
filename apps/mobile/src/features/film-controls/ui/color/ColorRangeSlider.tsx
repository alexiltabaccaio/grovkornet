import React, { useMemo } from 'react';
import { View, StyleSheet, TextInput, Text, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFilmStore, useFilmWorklets } from '@entities/film';

const SCREEN_WIDTH = Dimensions.get('window').width;
const INITIAL_TRACK_WIDTH = SCREEN_WIDTH - 188;

const COLOR_MAPPING = [
  { key: 'red', color: '#FF453A' },
  { key: 'orange', color: '#FF9F0A' },
  { key: 'yellow', color: '#FFD60A' },
  { key: 'green', color: '#32D74B' },
  { key: 'cyan', color: '#64D2FF' },
  { key: 'blue', color: '#0A84FF' },
  { key: 'purple', color: '#BF5AF2' },
  { key: 'magenta', color: '#FF2D55' },
] as const;

const BOUND_STORE_KEYS = [
  'boundRedOrange',     // 0: divide Red (0) e Orange (1)
  'boundOrangeYellow',  // 1: divide Orange (1) e Yellow (2)
  'boundYellowGreen',   // 2: divide Yellow (2) e Green (3)
  'boundGreenCyan',     // 3: divide Green (3) e Cyan (4)
  'boundCyanBlue',      // 4: divide Cyan (4) e Blue (5)
  'boundBluePurple',    // 5: divide Blue (5) e Purple (6)
  'boundPurpleMagenta',  // 6: divide Purple (6) e Magenta (7)
  'boundMagentaRed',    // 7: divide Magenta (7) e Red (0)
] as const;

const BOUND_WORKLET_KEYS = [
  'updateBoundRedOrange',
  'updateBoundOrangeYellow',
  'updateBoundYellowGreen',
  'updateBoundGreenCyan',
  'updateBoundCyanBlue',
  'updateBoundBluePurple',
  'updateBoundPurpleMagenta',
  'updateBoundMagentaRed',
] as const;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ColorRangeSliderProps {
  activeColorIndex: number; // 0 to 7
}

export const ColorRangeSlider = ({ activeColorIndex }: ColorRangeSliderProps) => {
  const store = useFilmStore();
  const worklets = useFilmWorklets();
  const trackWidth = useSharedValue(INITIAL_TRACK_WIDTH);
  const dragRefAngle = useSharedValue(0);

  // Map keys for the store dynamically
  const leftKey = BOUND_STORE_KEYS[(activeColorIndex - 1 + 8) % 8];
  const rightKey = BOUND_STORE_KEYS[activeColorIndex];
  const limitLeftKey = BOUND_STORE_KEYS[(activeColorIndex - 2 + 8) % 8];
  const limitRightKey = BOUND_STORE_KEYS[(activeColorIndex + 1) % 8];

  const leftShared = store[leftKey];
  const rightShared = store[rightKey];
  const limitLeftShared = store[limitLeftKey];
  const limitRightShared = store[limitRightKey];

  const leftWorkletKey = BOUND_WORKLET_KEYS[(activeColorIndex - 1 + 8) % 8];
  const rightWorkletKey = BOUND_WORKLET_KEYS[activeColorIndex];
  
  const updateLeftBound = worklets[leftWorkletKey];
  const updateRightBound = worklets[rightWorkletKey];

  // Helper to unwrap angles relative to a reference angle on the chromatic circle
  const unwrap = (h: number, ref: number) => {
    'worklet';
    let val = h;
    while (val < ref) val += 360;
    while (val >= ref + 360) val -= 360;
    return val;
  };

  const getMinAngle = () => {
    'worklet';
    return dragRefAngle.value;
  };

  const getMaxAngle = () => {
    'worklet';
    return unwrap(limitRightShared.value, dragRefAngle.value);
  };

  // Convert Angle to Pixel position
  const angleToX = (angle: number) => {
    'worklet';
    if (trackWidth.value === 0) return 6;
    const minA = getMinAngle();
    const maxA = getMaxAngle();
    const totalRange = maxA - minA;
    if (totalRange <= 0) return 6;
    const pct = (angle - minA) / totalRange;
    return 6 + pct * (trackWidth.value - 12);
  };

  // Convert Pixel position to Angle
  const xToAngle = (x: number) => {
    'worklet';
    if (trackWidth.value === 0) return getMinAngle();
    const minA = getMinAngle();
    const maxA = getMaxAngle();
    const totalRange = maxA - minA;
    const pct = Math.min(Math.max((x - 6) / (trackWidth.value - 12), 0), 1);
    return minA + pct * totalRange;
  };

  // Left thumb pan gesture
  const startXLeft = useSharedValue(0);
  const panGestureLeft = Gesture.Pan()
    .onStart(() => {
      dragRefAngle.value = limitLeftShared.value;
      const currentUnwrapped = unwrap(leftShared.value, dragRefAngle.value);
      startXLeft.value = angleToX(currentUnwrapped);
    })
    .onUpdate((event) => {
      const newX = startXLeft.value + event.translationX;
      const newAngleUnwrapped = xToAngle(newX);
      
      const minVal = dragRefAngle.value;
      const maxVal = unwrap(rightShared.value, dragRefAngle.value);
      
      const clampedAngleUnwrapped = Math.min(Math.max(newAngleUnwrapped, minVal), maxVal);
      
      let finalAngle = clampedAngleUnwrapped % 360;
      if (finalAngle < 0) finalAngle += 360;
      updateLeftBound(finalAngle);
    });

  // Right thumb pan gesture
  const startXRight = useSharedValue(0);
  const panGestureRight = Gesture.Pan()
    .onStart(() => {
      dragRefAngle.value = limitLeftShared.value;
      const currentUnwrapped = unwrap(rightShared.value, dragRefAngle.value);
      startXRight.value = angleToX(currentUnwrapped);
    })
    .onUpdate((event) => {
      const newX = startXRight.value + event.translationX;
      const newAngleUnwrapped = xToAngle(newX);
      
      const minVal = unwrap(leftShared.value, dragRefAngle.value);
      const maxVal = unwrap(limitRightShared.value, dragRefAngle.value);
      
      const clampedAngleUnwrapped = Math.min(Math.max(newAngleUnwrapped, minVal), maxVal);
      
      let finalAngle = clampedAngleUnwrapped % 360;
      if (finalAngle < 0) finalAngle += 360;
      updateRightBound(finalAngle);
    });

  // Animated background track sections
  const leftBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedLeft = unwrap(leftShared.value, ref);
      widthVal = ((unwrappedLeft - ref) / range) * (trackWidth.value - 12);
    }
    
    return {
      left: 6,
      width: Math.max(widthVal, 0),
    };
  });

  const centerBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let leftVal = 0;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedLeft = unwrap(leftShared.value, ref);
      const unwrappedRight = unwrap(rightShared.value, ref);
      leftVal = ((unwrappedLeft - ref) / range) * (trackWidth.value - 12);
      widthVal = ((unwrappedRight - unwrappedLeft) / range) * (trackWidth.value - 12);
    }
    
    return {
      left: 6 + leftVal,
      width: Math.max(widthVal, 0),
    };
  });

  const rightBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let leftVal = 0;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedRight = unwrap(rightShared.value, ref);
      leftVal = ((unwrappedRight - ref) / range) * (trackWidth.value - 12);
      widthVal = (trackWidth.value - 12) - leftVal;
    }
    
    return {
      left: 6 + leftVal,
      width: Math.max(widthVal, 0),
    };
  });

  // Thumb positions
  const leftThumbStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let x = 6;
    if (range > 0 && trackWidth.value > 0) {
      const unwrapped = unwrap(leftShared.value, ref);
      x = 6 + ((unwrapped - ref) / range) * (trackWidth.value - 12);
    }
    return {
      transform: [{ translateX: x - 10 }],
    };
  });

  const rightThumbStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let x = 6;
    if (range > 0 && trackWidth.value > 0) {
      const unwrapped = unwrap(rightShared.value, ref);
      x = 6 + ((unwrapped - ref) / range) * (trackWidth.value - 12);
    }
    return {
      transform: [{ translateX: x - 10 }],
    };
  });

  // Animated text inputs to display exact values at 60 FPS
  const leftLabelProps = useAnimatedProps((): Record<string, unknown> => {
    const val = Math.round(leftShared.value).toString() + '°';
    return { text: val, defaultValue: val };
  });

  const rightLabelProps = useAnimatedProps((): Record<string, unknown> => {
    const val = Math.round(rightShared.value).toString();
    return { text: val, defaultValue: val };
  });

  const prevColorHex = COLOR_MAPPING[(activeColorIndex - 1 + 8) % 8].color;
  const activeColorHex = COLOR_MAPPING[activeColorIndex].color;
  const nextColorHex = COLOR_MAPPING[(activeColorIndex + 1) % 8].color;

  return (
    <View style={styles.container}>
      {/* Left Bound Label (Fixed Position) */}
      <View style={styles.leftValueContainer}>
        <AnimatedTextInput
          editable={false}
          pointerEvents="none"
          animatedProps={leftLabelProps}
          style={styles.valueText}
        />
      </View>

      {/* Slider Track with 3-color background sections and two pans */}
      <View
        testID="color-range-slider-track"
        style={styles.sliderTrackContainer}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.trackBgSection, leftBgStyle, { backgroundColor: prevColorHex }]} />
        <Animated.View style={[styles.trackBgSection, centerBgStyle, { backgroundColor: activeColorHex }]} />
        <Animated.View style={[styles.trackBgSection, rightBgStyle, { backgroundColor: nextColorHex }]} />

        {/* Left Thumb */}
        <GestureDetector gesture={panGestureLeft}>
          <Animated.View style={[styles.thumb, leftThumbStyle, { borderColor: activeColorHex }]} />
        </GestureDetector>

        {/* Right Thumb */}
        <GestureDetector gesture={panGestureRight}>
          <Animated.View style={[styles.thumb, rightThumbStyle, { borderColor: activeColorHex }]} />
        </GestureDetector>
      </View>

      {/* Right Bound Label (Fixed Position) */}
      <View style={styles.rightValueContainer}>
        <AnimatedTextInput
          editable={false}
          pointerEvents="none"
          animatedProps={rightLabelProps}
          style={styles.valueText}
        />
        <Text style={styles.rightDegreeSymbol}>°</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    height: 32, // Match the typical height of SliderThumb
  },
  leftValueContainer: {
    width: 54, // Match width of AutoButton space in SliderThumb
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightValueContainer: {
    width: 54, // Match width of valueTextContainer in SliderThumb
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
  },
  rightDegreeSymbol: {
    position: 'absolute',
    right: -8,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  sliderTrackContainer: {
    flex: 1, // Will perfectly align with standard SliderThumb track
    height: 30, // Area sensibile per il touch
    position: 'relative',
    justifyContent: 'center',
  },
  trackBgSection: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
});
