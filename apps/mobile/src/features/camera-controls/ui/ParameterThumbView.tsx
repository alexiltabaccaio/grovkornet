import React, { forwardRef } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useAnimatedProps, interpolateColor } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface ParameterThumbViewProps {
  label: string;
  isActive: boolean;
  value?: SharedValue<number>;
  minValue?: number;
  maxValue?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  renderValue?: boolean;
  valueFormatter?: (val: number) => string;
  variant?: 'square' | 'text';
  isAuto?: SharedValue<boolean>;
  staticText?: string;
  hideValueInAuto?: boolean;
  autoValueText?: string;
  isDebugEnabled?: boolean;
  disabled?: SharedValue<boolean>;
  hideAutoBadge?: boolean;
}

export const ParameterThumbView = forwardRef<View, ParameterThumbViewProps>(({
  label,
  isActive,
  value,
  minValue = 0,
  maxValue = 1,
  icon,
  renderValue,
  valueFormatter,
  variant = 'square',
  isAuto,
  staticText,
  hideValueInAuto = false,
  autoValueText = 'AUTO',
  isDebugEnabled = false,
  disabled,
  hideAutoBadge = false,
}, ref) => {
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

  const isShowingValue = renderValue || variant === 'text';

  return (
    <Animated.View 
      ref={ref}
      style={[
        styles.filterThumb,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]} 
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <View style={[
        styles.filterPlaceholder,
        variant === 'square' && isActive && styles.filterPlaceholderActive,
        variant === 'square' && styles.iconPlaceholder,
        variant === 'text' && styles.textVariantPlaceholder,
        isDebugEnabled && variant === 'text' && { backgroundColor: 'rgba(255,0,0,0.2)', borderWidth: 1, borderColor: 'red' }
      ]}>
        {variant === 'square' && <Animated.View style={[styles.progressFill, animatedBgStyle]} />}
        
        {isShowingValue && value ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
            <AnimatedTextInput
              pointerEvents="none"
              underlineColorAndroid="transparent"
              editable={false}
              style={[
                styles.valueText, 
                variant === 'text' && styles.valueTextLarge,
                animatedTextStyle
              ]}
              animatedProps={animatedTextProps}
            />
          </View>
        ) : staticText ? (
          <Text 
            style={[
            styles.valueText, 
            variant === 'text' && styles.valueTextLarge,
            { color: isActive ? "#FFF" : "#666" }
          ]}>
            {staticText}
          </Text>
        ) : icon ? (
          <AnimatedIcon name={icon} size={24} style={{ zIndex: 1 }} animatedProps={animatedIconProps} />
        ) : null}
        
        {(isAuto || disabled) && (
          <AnimatedTextInput
            pointerEvents="none"
            underlineColorAndroid="transparent"
            editable={false}
            style={[styles.autoBadge, { padding: 0, margin: 0, textAlign: 'center' }, animatedBadgeStyle]}
            animatedProps={animatedBadgeProps}
          />
        )}
        

        {variant === 'square' && (
          <View style={[styles.borderOverlay, isActive && styles.borderOverlayActive]} pointerEvents="none" />
        )}
      </View>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {label.toUpperCase()}
      </Text>
    </Animated.View>
  );
});

ParameterThumbView.displayName = 'ParameterThumbView';

const styles = StyleSheet.create({
  filterThumb: {
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  filterPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#22',
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textVariantPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
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
