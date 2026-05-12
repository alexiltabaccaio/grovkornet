import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

interface VerticalSlidersProps {
  grainIntensity: SharedValue<number>;
  saturation: SharedValue<number>;
  onGrainIntensityChange: (val: number) => void;
  onSaturationChange: (val: number) => void;
  activeTab: 'grain' | 'saturation';
}

export const VerticalSliders = ({
  grainIntensity,
  saturation,
  onGrainIntensityChange,
  onSaturationChange,
  activeTab,
}: VerticalSlidersProps) => {
  const [displayValue, setDisplayValue] = useState(0.5);

  const handleStyle = useAnimatedStyle(() => {
    const val = activeTab === 'grain' ? grainIntensity.value : saturation.value;
    return {
      bottom: val * SLIDER_HEIGHT,
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const val = activeTab === 'grain' ? grainIntensity.value : saturation.value;
    return {
      height: val * SLIDER_HEIGHT,
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
      runOnJS(setDisplayValue)(newValue);
    });

  // Sincronizza il valore visualizzato quando cambia il tab
  React.useEffect(() => {
    const currentVal = activeTab === 'grain' ? grainIntensity.value : saturation.value;
    setDisplayValue(currentVal);
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>{Math.round(displayValue * 100)}%</Text>
        <GestureDetector gesture={gesture}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
            <Animated.View style={[styles.handle, handleStyle]} />
          </View>
        </GestureDetector>
        <Text style={styles.iconLabel}>{activeTab === 'grain' ? 'GRN' : 'SAT'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: SCREEN_HEIGHT * 0.2,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inactive: {
    opacity: 0.3,
    transform: [{ scale: 0.9 }],
  },
  track: {
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    justifyContent: 'flex-end',
    marginVertical: 10,
    position: 'relative',
  },
  fill: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  handle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    left: -8,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  iconLabel: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
});
