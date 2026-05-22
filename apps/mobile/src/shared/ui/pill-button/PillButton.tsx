import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

export interface PillButtonProps {
  label: string;
  isActive: boolean | SharedValue<boolean>;
  onPress: () => void;
  variant?: 'default' | 'auto' | 'module';
  isDebugEnabled?: boolean;
  opacity?: number | SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const getColors = (variant: 'default' | 'auto' | 'module', active: boolean) => {
  'worklet';
  if (!active) {
    if (variant === 'module') {
      return {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        textColor: '#888',
      };
    }
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
  if (variant === 'module') {
    return {
      borderColor: 'transparent',
      backgroundColor: '#2C2C2E',
      textColor: '#FFF',
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
    <TouchableOpacity onPress={onPress} containerStyle={[styles.pressable, style]} style={styles.pressable} activeOpacity={1}>
      <Animated.View
        style={[
          styles.pillButton,
          variant === 'auto' && styles.autoButton,
          animatedStyle,
          isDebugEnabled && styles.debugStyle,
        ]}
      >
        <Animated.Text
          style={[styles.pillText, animatedTextStyle, textStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
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
    alignSelf: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  autoButton: {
    width: 32,
    alignSelf: 'auto',
  },
  debugStyle: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderColor: 'green',
  },
});
