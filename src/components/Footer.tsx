import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, FadeIn, FadeOut, SharedValue, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;

interface FooterProps {
  enabled: SharedValue<boolean>;
  saturation: SharedValue<number>;
  onGrainToggle: (val: boolean) => void;
  onSaturationChange: (val: number) => void;
}

export const Footer = ({ enabled, saturation, onGrainToggle, onSaturationChange }: FooterProps) => {
  const [showSlider, setShowSlider] = useState(false);
  const [saturationDisplay, setSaturationDisplay] = useState(1);
  const [isGrainEnabled, setIsGrainEnabled] = useState(false);

  const toggleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(enabled.value ? 80 : 0, { damping: 15, stiffness: 100 }) }],
    };
  });

  const sliderHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: saturation.value * SLIDER_WIDTH }],
    };
  });

  const sliderFillStyle = useAnimatedStyle(() => {
    return {
      width: `${saturation.value * 100}%`,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newValue = Math.min(Math.max(e.x / SLIDER_WIDTH, 0), 1);
      saturation.value = newValue; // Aggiornamento sincrono sull'UI Thread!
      runOnJS(setSaturationDisplay)(newValue); // Aggiorna il testo su JS thread
      runOnJS(onSaturationChange)(newValue);
    });

  const handleToggle = (value: boolean) => {
    enabled.value = value;
    setIsGrainEnabled(value);
    onGrainToggle(value);
  };

  return (
    <View style={styles.container}>
      {showSlider && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          style={styles.sliderWrapper}
        >
          <Text style={styles.sliderLabel}>{Math.round(saturationDisplay * 100)}%</Text>
          <GestureDetector gesture={panGesture}>
            <View style={styles.sliderTouchArea}>
              <View style={styles.sliderTrack}>
                <Animated.View style={[styles.sliderFill, sliderFillStyle]} />
                <Animated.View style={[styles.sliderHandle, sliderHandleStyle]} />
              </View>
            </View>
          </GestureDetector>
        </Animated.View>
      )}

      <View style={styles.footerInner}>
        <View style={styles.toggleContainer}>
          <Animated.View style={[styles.activeIndicator, toggleAnimatedStyle]} />
          
          <Pressable style={styles.option} onPress={() => handleToggle(false)}>
            <Text style={[styles.label, !isGrainEnabled && styles.labelActive]}>OFF</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={() => handleToggle(true)}>
            <Text style={[styles.label, isGrainEnabled && styles.labelActive]}>ON</Text>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.iconButton, showSlider && styles.iconButtonActive]} 
          onPress={() => setShowSlider(!showSlider)}
          hitSlop={15}
        >
          <Ionicons 
            name="color-palette-outline" 
            size={24} 
            color={showSlider ? "#000" : "#FFF"} 
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  footerInner: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.95)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  sliderWrapper: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sliderLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
  },
  sliderTouchArea: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  sliderHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#000',
    left: -10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    width: 160,
    height: 44,
    borderRadius: 22,
    padding: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 76,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  labelActive: {
    color: '#000',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconButtonActive: {
    backgroundColor: '#FFF',
  },
});
