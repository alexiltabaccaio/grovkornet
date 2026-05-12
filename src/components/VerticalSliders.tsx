import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { TabType, ImageToolType } from '../types/camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

interface VerticalSlidersProps {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  contrast: SharedValue<number>;
  onGrainIntensityChange: (val: number) => void;
  onSaturationChange: (val: number) => void;
  onContrastChange: (val: number) => void;
  activeTab: TabType;
  activeImageTool: ImageToolType;
}

export const VerticalSliders = ({
  grainIntensity,
  saturation,
  contrast,
  onGrainIntensityChange,
  onSaturationChange,
  onContrastChange,
  activeTab,
  activeImageTool,
}: VerticalSlidersProps) => {

  const handleStyle = useAnimatedStyle(() => {
    let val = 0;
    if (activeTab === 'grain') {
      val = grainIntensity.value;
    } else {
      const rawVal = activeImageTool === 'saturation' ? saturation.value : contrast.value;
      val = rawVal / 2.0;
    }
    return {
      bottom: val * SLIDER_HEIGHT,
    };
  });

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const normalizedValue = Math.min(Math.max(1 - (e.y / SLIDER_HEIGHT), 0), 1);
      if (activeTab === 'grain') {
        grainIntensity.value = normalizedValue;
        runOnJS(onGrainIntensityChange)(normalizedValue);
      } else {
        const scaledValue = normalizedValue * 2.0;
        if (activeImageTool === 'saturation') {
          saturation.value = scaledValue;
          runOnJS(onSaturationChange)(scaledValue);
        } else {
          contrast.value = scaledValue;
          runOnJS(onContrastChange)(scaledValue);
        }
      }
    });

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <GestureDetector gesture={gesture}>
          <View style={styles.track}>
            <View style={styles.visualTrack} />
            <Animated.View style={[styles.handle, handleStyle]} />
          </View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
    alignItems: 'flex-end',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  track: {
    width: 40,
    height: SLIDER_HEIGHT,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  visualTrack: {
    width: 4,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'absolute',
  },
  handle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    left: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});
