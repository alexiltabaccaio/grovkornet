import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const TextThumb = ({
  isActive,
  value,
  valueFormatter,
  isAuto,
  staticText,
  hideValueInAuto = false,
  autoValueText = 'AUTO',
  disabled,
  isToggle,
}: ParameterThumbViewProps) => {
  const animatedTextProps = useAnimatedProps(() => {
    if (!value) return { text: '' };

    if (isAuto && isAuto.value && hideValueInAuto) {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
      return {
        text: autoValueText,
        defaultValue: autoValueText,
      } as any;
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    }

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
    const isHighlighted = isToggle && value ? (value.value === 1) : isActive;
    return { color: isHighlighted ? "#FFF" : "#888" };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return {
        borderColor: '#222',
        backgroundColor: 'rgba(255,255,255,0.01)',
      };
    }
    const isHighlighted = isToggle && value ? (value.value === 1) : isActive;
    return {
      borderColor: isHighlighted ? '#FFF' : '#333',
      backgroundColor: isHighlighted ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
    };
  });

  if (value) {
    return (
      <Animated.View style={[styles.pillButton, animatedContainerStyle]}>
        <AnimatedTextInput
          pointerEvents="none"
          underlineColorAndroid="transparent"
          editable={false}
          style={[
            styles.pillValueText,
            animatedTextStyle
          ]}
          animatedProps={animatedTextProps}
        />
      </Animated.View>
    );
  }

  if (staticText) {
    return (
      <View style={[styles.pillButton, isActive ? styles.pillButtonActive : styles.pillButtonInactive]}>
        <Text
          style={[
            styles.pillValueText,
            { color: isActive ? "#FFF" : "#888" }
          ]}>
          {staticText}
        </Text>
      </View>
    );
  }

  return null;
};
