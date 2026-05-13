import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useAnimatedProps, interpolateColor, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Rect, Shader, SkRuntimeEffect } from '@shopify/react-native-skia';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

interface FilterParameterThumbProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  value?: SharedValue<number>;
  maxValue?: number;
  onChange?: (val: number) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  skiaEffect?: SkRuntimeEffect | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skiaUniforms?: any; // Skia uniforms are dynamically typed as any in the framework
}

export const FilterParameterThumb = ({ 
  label, 
  isActive, 
  onPress, 
  value,
  maxValue = 1,
  onChange,
  icon, 
  skiaEffect, 
  skiaUniforms 
}: FilterParameterThumbProps) => {
  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      if (!value) return;
      startVal.value = value.value;
      runOnJS(onPress)();
    })
    .onUpdate((e) => {
      if (!value) return;
      const THUMB_SENSITIVITY = 150;
      const delta = -(e.translationY / THUMB_SENSITIVITY) * maxValue;
      const newValue = Math.min(Math.max(startVal.value + delta, 0), maxValue);
      value.value = newValue;
      if (onChange) {
        runOnJS(onChange)(newValue);
      }
    });

  const animatedBgStyle = useAnimatedStyle(() => {
    if (!value) return { height: '0%' };
    const clampedValue = Math.max(0, Math.min(value.value, maxValue));
    return {
      height: `${(clampedValue / maxValue) * 105}%`,
      backgroundColor: interpolateColor(clampedValue, [0, maxValue], ['#222222', '#FFFFFF'])
    };
  });

  const animatedIconProps = useAnimatedProps(() => {
    if (!value) return { color: isActive ? "#FFF" : "#666" };
    const clampedValue = Math.max(0, Math.min(value.value, maxValue));
    return {
      color: interpolateColor(clampedValue, [0, maxValue], [isActive ? "#FFF" : "#666", "#000000"])
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Pressable style={styles.filterThumb} onPress={onPress}>
        <View style={[
        styles.filterPlaceholder,
        isActive && styles.filterPlaceholderActive,
        !skiaEffect && styles.iconPlaceholder
      ]}>
        <Animated.View style={[styles.progressFill, animatedBgStyle]} />
        
        {icon && (
          <AnimatedIcon name={icon} size={24} style={{ zIndex: 1 }} animatedProps={animatedIconProps} />
        )}
        
        {skiaEffect && (
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={48} height={48}>
              <Shader source={skiaEffect} uniforms={skiaUniforms} />
            </Rect>
          </Canvas>
        )}
        <View style={[styles.borderOverlay, isActive && styles.borderOverlayActive]} pointerEvents="none" />
      </View>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label.toUpperCase()}
      </Text>
      </Pressable>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  filterThumb: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  filterPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#222',
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPlaceholderActive: {
    backgroundColor: '#000',
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#444',
  },
  borderOverlayActive: {
    borderColor: '#FFF',
  },
  iconPlaceholder: {
    backgroundColor: '#111',
  },
  progressFill: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    right: -2,
  },
  canvas: {
    width: 48,
    height: 48,
  },
  filterText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFF',
  },
});
