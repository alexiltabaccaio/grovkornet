import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Rect, Shader, SkRuntimeEffect } from '@shopify/react-native-skia';

interface FilterParameterThumbProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  progressStyle: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  icon?: keyof typeof Ionicons.glyphMap;
  skiaEffect?: SkRuntimeEffect | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skiaUniforms?: any; // Skia uniforms are dynamically typed as any in the framework
}

export const FilterParameterThumb = ({ 
  label, 
  isActive, 
  onPress, 
  progressStyle, 
  icon, 
  skiaEffect, 
  skiaUniforms 
}: FilterParameterThumbProps) => {
  return (
    <Pressable style={styles.filterThumb} onPress={onPress}>
      <View style={[
        styles.filterPlaceholder,
        isActive && styles.filterPlaceholderActive,
        !skiaEffect && styles.iconPlaceholder
      ]}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
        
        {icon && (
          <Ionicons name={icon} size={24} color={isActive ? "#FFF" : "#666"} style={{ zIndex: 1 }} />
        )}
        
        {skiaEffect && (
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={48} height={48}>
              <Shader source={skiaEffect} uniforms={skiaUniforms} />
            </Rect>
          </Canvas>
        )}
      </View>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
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
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPlaceholderActive: {
    borderColor: '#FFF',
    backgroundColor: '#000',
  },
  iconPlaceholder: {
    backgroundColor: '#111',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    opacity: 0.3,
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
