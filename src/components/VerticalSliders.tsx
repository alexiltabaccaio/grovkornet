import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { TabType } from '../types/camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

interface VerticalSlidersProps {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  onGrainIntensityChange: (val: number) => void;
  onSaturationChange: (val: number) => void;
  activeTab: TabType;
}

export const VerticalSliders = ({
  grainIntensity,
  saturation,
  onGrainIntensityChange,
  onSaturationChange,
  activeTab,
}: VerticalSlidersProps) => {

  const handleStyle = useAnimatedStyle(() => {
    const val = activeTab === 'grain' ? grainIntensity.value : saturation.value;
    return {
      bottom: val * SLIDER_HEIGHT,
    };
  });

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const newValue = Math.min(Math.max(1 - (e.y / SLIDER_HEIGHT), 0), 1);
      if (activeTab === 'grain') {
        grainIntensity.value = newValue;
        runOnJS(onGrainIntensityChange)(newValue);
      } else {
        saturation.value = newValue;
        runOnJS(onSaturationChange)(newValue);
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
