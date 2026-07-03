import React, { memo, useRef, useEffect } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import * as Haptics from '../../lib/haptics';

export interface PillButtonProps {
  label: string;
  isActive: boolean | SharedValue<boolean>;
  onPress: () => void;
  variant?: 'default' | 'auto' | 'module';
  isLayoutOverlayEnabled?: boolean;
  opacity?: number | SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const getColors = (variant: 'default' | 'auto' | 'module', active: boolean, isLayoutOverlayEnabled: boolean) => {
  'worklet';
  if (isLayoutOverlayEnabled) {
    if (variant === 'module') {
      return {
        borderColor: 'cyan',
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        textColor: active ? '#FFF' : '#888',
      };
    }
    if (!active) {
      return {
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        textColor: '#888',
      };
    }
  }

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

const StaticPillButton = memo(({
  label,
  isActive,
  onPress,
  variant = 'default',
  isLayoutOverlayEnabled = false,
  opacity = 1,
  style,
  textStyle,
}: PillButtonProps) => {
  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  const handlePress = React.useCallback(() => {
    void Haptics.selectionAsync();
    onPressRef.current();
  }, []);

  const active = typeof isActive === 'boolean' ? isActive : false;
  const op = typeof opacity === 'number' ? opacity : 1;
  const colors = getColors(variant, active, isLayoutOverlayEnabled);

  return (
    <View style={style}>
      <TouchableOpacity 
        onPress={handlePress} 
        style={[styles.pressable, { width: '100%' }]} 
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View
          style={[
            styles.pillButton,
            variant === 'auto' && styles.autoButton,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.backgroundColor,
              opacity: op,
            }
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.pillText, { color: colors.textColor }, textStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

StaticPillButton.displayName = 'StaticPillButton';

const AnimatedPillButton = memo(({
  label,
  isActive,
  onPress,
  variant = 'default',
  isLayoutOverlayEnabled = false,
  opacity = 1,
  style,
  textStyle,
}: PillButtonProps) => {
  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  const handlePress = React.useCallback(() => {
    void Haptics.selectionAsync();
    onPressRef.current();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const active = typeof isActive === 'object' && 'value' in isActive ? isActive.value : isActive;
    const op = typeof opacity === 'object' && 'value' in opacity ? opacity.value : opacity;
    const colors = getColors(variant, active, isLayoutOverlayEnabled);

    return {
      borderColor: colors.borderColor,
      backgroundColor: colors.backgroundColor,
      opacity: op,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const active = typeof isActive === 'object' && 'value' in isActive ? isActive.value : isActive;
    const colors = getColors(variant, active, isLayoutOverlayEnabled);

    return {
      color: colors.textColor,
    };
  });

  return (
    <View style={style}>
      <TouchableOpacity 
        onPress={handlePress} 
        style={[styles.pressable, { width: '100%' }]} 
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Animated.View
          style={[
            styles.pillButton,
            variant === 'auto' && styles.autoButton,
            animatedStyle,
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
    </View>
  );
});

AnimatedPillButton.displayName = 'AnimatedPillButton';

const arePropsEqual = (prevProps: PillButtonProps, nextProps: PillButtonProps) => {
  if (prevProps.label !== nextProps.label) return false;
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.isLayoutOverlayEnabled !== nextProps.isLayoutOverlayEnabled) return false;

  const getVal = (val: boolean | number | SharedValue<boolean> | SharedValue<number> | undefined): boolean | number | undefined => 
    typeof val === 'object' && val !== null && 'value' in val ? (val as SharedValue<boolean | number>).value : val;

  if (getVal(prevProps.isActive) !== getVal(nextProps.isActive)) return false;
  if (getVal(prevProps.opacity) !== getVal(nextProps.opacity)) return false;

  if (JSON.stringify(prevProps.style) !== JSON.stringify(nextProps.style)) return false;
  if (JSON.stringify(prevProps.textStyle) !== JSON.stringify(nextProps.textStyle)) return false;

  return true;
};

export const PillButton = memo((props: PillButtonProps) => {
  const { isActive, opacity } = props;
  const isShared = (val: unknown) => typeof val === 'object' && val !== null && 'value' in (val as Record<string, unknown>);
  const needsAnimation = isShared(isActive) || isShared(opacity);

  if (needsAnimation) {
    return <AnimatedPillButton {...props} />;
  }
  return <StaticPillButton {...props} />;
}, arePropsEqual);

PillButton.displayName = 'PillButton';

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
});
