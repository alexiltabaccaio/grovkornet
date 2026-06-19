import React from 'react';
import { View, StyleSheet, TextInput, Text, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFilmStore, useFilmWorklets } from '@entities/film';
import { unwrap } from '../../lib/colorMath';
import { useColorRangeGestures } from '../../lib/useColorRangeGestures';
import { ColorRangeTrack } from './ColorRangeTrack';
import { ColorRangeThumb } from './ColorRangeThumb';
import { globalSubFullTrackWidth, setGlobalSubFullTrackWidth } from '@shared/ui/parameter-thumb';
import {
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_BOUND_MAGENTA_RED,
} from '@grovkornet/shared';

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
  'boundRedOrange',     // 0: splits Red (0) and Orange (1)
  'boundOrangeYellow',  // 1: splits Orange (1) and Yellow (2)
  'boundYellowGreen',   // 2: splits Yellow (2) and Green (3)
  'boundGreenCyan',     // 3: splits Green (3) and Cyan (4)
  'boundCyanBlue',      // 4: splits Cyan (4) and Blue (5)
  'boundBluePurple',    // 5: splits Blue (5) and Purple (6)
  'boundPurpleMagenta',  // 6: splits Purple (6) and Magenta (7)
  'boundMagentaRed',    // 7: splits Magenta (7) and Red (0)
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

const BOUND_DEFAULTS = [
  DEFAULT_BOUND_RED_ORANGE,
  DEFAULT_BOUND_ORANGE_YELLOW,
  DEFAULT_BOUND_YELLOW_GREEN,
  DEFAULT_BOUND_GREEN_CYAN,
  DEFAULT_BOUND_CYAN_BLUE,
  DEFAULT_BOUND_BLUE_PURPLE,
  DEFAULT_BOUND_PURPLE_MAGENTA,
  DEFAULT_BOUND_MAGENTA_RED,
];

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ColorRangeSliderProps {
  activeColorIndex: number; // 0 to 7
}

export const ColorRangeSlider = ({ activeColorIndex }: ColorRangeSliderProps) => {
  const store = useFilmStore();
  const worklets = useFilmWorklets();
  const trackWidth = useSharedValue(globalSubFullTrackWidth);

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

  const leftDefault = BOUND_DEFAULTS[(activeColorIndex - 1 + 8) % 8];
  const rightDefault = BOUND_DEFAULTS[activeColorIndex];

  const combinedGesture = useColorRangeGestures({
    trackWidth,
    leftShared,
    rightShared,
    limitLeftShared,
    limitRightShared,
    updateLeftBound,
    updateRightBound,
    leftDefault,
    rightDefault,
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
      transform: [{ translateX: x - 6 }],
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
      transform: [{ translateX: x - 6 }],
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
      <GestureDetector gesture={combinedGesture}>
        <View
          testID="color-range-slider-track"
          style={styles.sliderTrackContainer}
          onLayout={(e) => {
            if (e.nativeEvent.layout.width > 0) {
              trackWidth.value = e.nativeEvent.layout.width;
              setGlobalSubFullTrackWidth(e.nativeEvent.layout.width);
            }
          }}
        >
          <ColorRangeTrack
            trackWidth={trackWidth}
            leftShared={leftShared}
            rightShared={rightShared}
            limitLeftShared={limitLeftShared}
            limitRightShared={limitRightShared}
            prevColorHex={prevColorHex}
            activeColorHex={activeColorHex}
            nextColorHex={nextColorHex}
          />
  
          {/* Left Thumb */}
          <ColorRangeThumb style={leftThumbStyle as unknown as StyleProp<ViewStyle>} activeColorHex={activeColorHex} />
  
          {/* Right Thumb */}
          <ColorRangeThumb style={rightThumbStyle as unknown as StyleProp<ViewStyle>} activeColorHex={activeColorHex} />
        </View>
      </GestureDetector>

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
    height: 30, // Touch-sensitive area
    position: 'relative',
    justifyContent: 'center',
  },
});
