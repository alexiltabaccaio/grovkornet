import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
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
    return { color: isActive ? "#FFF" : "#666" };
  });

  if (value) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
        <AnimatedTextInput
          pointerEvents="none"
          underlineColorAndroid="transparent"
          editable={false}
          style={[
            styles.valueText,
            styles.valueTextLarge,
            animatedTextStyle
          ]}
          animatedProps={animatedTextProps}
        />
      </View>
    );
  }

  if (staticText) {
    return (
      <Text
        style={[
          styles.valueText,
          styles.valueTextLarge,
          { color: isActive ? "#FFF" : "#666" }
        ]}>
        {staticText}
      </Text>
    );
  }

  return null;
};
