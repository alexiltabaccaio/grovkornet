import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

export interface PillButtonProps {
  label: string;
  isActive: boolean | SharedValue<boolean>;
  onPress: () => void;
  variant?: 'default' | 'auto';
  isDebugEnabled?: boolean;
  opacity?: number | SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const getColors = (variant: 'default' | 'auto', active: boolean) => {
  'worklet';
  if (!active) {
    return {
      borderColor: '#333',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      textColor: '#888',
    };
  }
  if (variant === 'auto') {
    return {
      borderColor: '#FF453A',
      backgroundColor: 'rgba(255, 69, 58, 0.15)',
      textColor: '#FF453A',
    };
  }
  return {
    borderColor: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    textColor: '#FFF',
  };
};

export const PillButton = ({
  label,
  isActive,
  onPress,
  variant = 'default',
  isDebugEnabled = false,
  opacity = 1,
  style,
  textStyle,
}: PillButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const active = typeof isActive === 'object' && 'value' in isActive ? isActive.value : isActive;
    const op = typeof opacity === 'object' && 'value' in opacity ? opacity.value : opacity;
    const colors = getColors(variant, active);

    return {
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      opacity: op,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const active = typeof isActive === 'object' && 'value' in isActive ? isActive.value : isActive;
    const colors = getColors(variant, active);

    return {
      color: colors.textColor,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} style={[styles.pressable, style]} activeOpacity={1}>
      <Animated.View
        style={[
          styles.pillButton,
          animatedStyle,
          isDebugEnabled && styles.debugStyle,
        ]}
      >
        <Animated.Text style={[styles.pillText, animatedTextStyle, textStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButton: {
    height: 32,
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  debugStyle: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderColor: 'green',
  },
});
