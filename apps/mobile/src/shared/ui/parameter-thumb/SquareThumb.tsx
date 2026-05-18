import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps, interpolateColor } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const SquareThumb = ({
  isActive,
  value,
  minValue = 0,
  maxValue = 1,
  icon,
  renderValue,
  valueFormatter,
  staticText,
  disabled,
}: ParameterThumbViewProps) => {
  const animatedBgStyle = useAnimatedStyle(() => {
    if (!value) return { height: '0%' };
    const clampedValue = Math.max(minValue, Math.min(value.value, maxValue));
    const range = maxValue - minValue;
    const progress = (clampedValue - minValue) / range;
    return {
      height: `${progress * 105}%`,
      backgroundColor: interpolateColor(progress, [0, 1], ['#222222', '#FFFFFF'])
    };
  });

  const animatedIconProps = useAnimatedProps(() => {
    if (!value) return { color: isActive ? "#FFF" : "#666" };
    const clampedValue = Math.max(minValue, Math.min(value.value, maxValue));
    const range = maxValue - minValue;
    const progress = (clampedValue - minValue) / range;
    return {
      color: interpolateColor(progress, [0, 1], [isActive ? "#FFF" : "#666", "#000000"])
    };
  });

  const animatedTextProps = useAnimatedProps(() => {
    if (!value || !renderValue) return { text: '' };
    const val = valueFormatter ? valueFormatter(value.value) : Math.round(value.value).toString();
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    return {
      text: val,
      defaultValue: val,
    } as any;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return { color: '#666666' };
    }
    if (!value) return { color: isActive ? "#FFF" : "#666" };
    const clampedValue = Math.max(minValue, Math.min(value.value, maxValue));
    const range = maxValue - minValue;
    const progress = (clampedValue - minValue) / range;
    return {
      color: interpolateColor(progress, [0, 1], [isActive ? "#FFF" : "#666", "#000000"])
    };
  });

  return (
    <>
      <Animated.View style={[styles.progressFill, animatedBgStyle]} />

      {renderValue && value ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
          <AnimatedTextInput
            pointerEvents="none"
            underlineColorAndroid="transparent"
            editable={false}
            style={[styles.valueText, animatedTextStyle]}
            animatedProps={animatedTextProps}
          />
        </View>
      ) : staticText ? (
        <Text
          style={[
            styles.valueText,
            { color: isActive ? "#FFF" : "#666" }
          ]}>
          {staticText}
        </Text>
      ) : icon ? (
        <AnimatedIcon name={icon} size={24} style={{ zIndex: 1 }} animatedProps={animatedIconProps} />
      ) : null}
    </>
  );
};
