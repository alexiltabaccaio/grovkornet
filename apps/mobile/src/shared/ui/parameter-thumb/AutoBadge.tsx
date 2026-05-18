import React from 'react';
import { TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const AutoBadge = ({
  isAuto,
  disabled,
  hideAutoBadge = false,
}: ParameterThumbViewProps) => {
  const animatedBadgeProps = useAnimatedProps(() => {
    if (disabled && disabled.value) {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
      return { text: 'OFF', defaultValue: 'OFF' } as any;
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    }
    if (isAuto && isAuto.value && !hideAutoBadge) {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
      return { text: 'AUTO', defaultValue: 'AUTO' } as any;
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    }
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    return { text: '', defaultValue: '' } as any;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return { opacity: 1, color: '#666666' };
    }
    if (isAuto && isAuto.value && !hideAutoBadge) {
      return { opacity: 1, color: '#FF3B30' };
    }
    return { opacity: 0, color: '#FF3B30' };
  });

  if (!isAuto && !disabled) return null;

  return (
    <AnimatedTextInput
      pointerEvents="none"
      underlineColorAndroid="transparent"
      editable={false}
      style={[styles.autoBadge, { padding: 0, margin: 0, textAlign: 'center' }, animatedBadgeStyle]}
      animatedProps={animatedBadgeProps}
    />
  );
};
