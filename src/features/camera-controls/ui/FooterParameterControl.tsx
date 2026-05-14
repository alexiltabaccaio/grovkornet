import React from 'react';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useAnimatedProps, interpolateColor, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';


const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface FooterParameterControlProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  onChange?: (val: number) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: 'square' | 'text';
  isAuto?: SharedValue<boolean>;
  onLongPress?: () => void;
}

export const FooterParameterControl = ({ 
  label, 
  isActive, 
  onPress, 
  value,
  minValue = 0,
  maxValue = 1,
  onChange,
  icon,
  renderValue,
  valueFormatter,
  variant = 'square',
  isAuto,
  onLongPress,
}: FooterParameterControlProps) => {
  const startVal = useSharedValue(minValue);

  const longPressGesture = Gesture.LongPress()
    .onStart(() => {
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!value) return;
      startVal.value = value.value;
      runOnJS(onPress)();
    })
    .onUpdate((e) => {
      if (!value) return;
      const THUMB_SENSITIVITY = 150;
      const range = maxValue - minValue;
      const delta = -(e.translationY / THUMB_SENSITIVITY) * range;
      const newValue = Math.min(Math.max(startVal.value + delta, minValue), maxValue);
      value.value = newValue;
      if (onChange) {
        runOnJS(onChange)(newValue);
      }
    });

  const animatedBgStyle = useAnimatedStyle(() => {
    if (!value || variant === 'text') return { height: '0%' };
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
    const isShowingValue = renderValue || variant === 'text';
    if (!value || !isShowingValue) return { text: '' };
    const val = valueFormatter ? valueFormatter(value.value) : Math.round(value.value).toString();
    return {
      text: val,
      defaultValue: val,
    } as any;
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (!value) return { color: isActive ? "#FFF" : "#666" };
    if (variant === 'text') {
      return { color: isActive ? "#FFF" : "#666" };
    }
    const clampedValue = Math.max(minValue, Math.min(value.value, maxValue));
    const range = maxValue - minValue;
    const progress = (clampedValue - minValue) / range;
    return {
      color: interpolateColor(progress, [0, 1], [isActive ? "#FFF" : "#666", "#000000"])
    };
  });

  const animatedAutoBadgeStyle = useAnimatedStyle(() => {
    return {
      opacity: isAuto && isAuto.value ? 1 : 0
    };
  });

  const isShowingValue = renderValue || variant === 'text';

  const combinedGesture = Gesture.Race(longPressGesture, panGesture);

  return (
    <GestureDetector gesture={combinedGesture}>
      <Pressable style={styles.filterThumb} onPress={onPress}>
        <View style={[
          styles.filterPlaceholder,
          variant === 'square' && isActive && styles.filterPlaceholderActive,
          variant === 'square' && styles.iconPlaceholder,
          variant === 'text' && styles.textVariantPlaceholder
        ]}>
          {variant === 'square' && <Animated.View style={[styles.progressFill, animatedBgStyle]} />}
          
          {isShowingValue && value ? (
            <AnimatedTextInput
              underlineColorAndroid="transparent"
              editable={false}
              value={valueFormatter ? valueFormatter(value.value) : Math.round(value.value).toString()}
              style={[
                styles.valueText, 
                variant === 'text' && styles.valueTextLarge,
                animatedTextStyle
              ]}
              animatedProps={animatedTextProps}
            />
          ) : icon ? (
            <AnimatedIcon name={icon} size={24} style={{ zIndex: 1 }} animatedProps={animatedIconProps} />
          ) : null}
          
          {isAuto && (
            <Animated.Text style={[styles.autoBadge, animatedAutoBadgeStyle]}>
              AUTO
            </Animated.Text>
          )}
          

          {variant === 'square' && (
            <View style={[styles.borderOverlay, isActive && styles.borderOverlayActive]} pointerEvents="none" />
          )}
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
  textVariantPlaceholder: {
    backgroundColor: 'transparent',
    overflow: 'visible',
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

  filterText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFF',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    zIndex: 1,
    padding: 0,
    margin: 0,
  },
  valueTextLarge: {
    fontSize: 18,
    width: 60,
  },
  autoBadge: {
    position: 'absolute',
    bottom: 2,
    fontSize: 8,
    fontWeight: '900',
    color: '#FF3B30',
    letterSpacing: 0.5,
    zIndex: 2,
  },
});
