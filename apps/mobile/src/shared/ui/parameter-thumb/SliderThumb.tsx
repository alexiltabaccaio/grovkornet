import React from 'react';
import { View, StyleSheet, TextInput, AppState } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { logger } from '../../lib/logger';
import { AutoButton } from '../auto-button/AutoButton';
import { 
  globalMainTrackWidth, 
  globalSubTrackWidth, 
  globalSubFullTrackWidth,
  setGlobalMainTrackWidth, 
  setGlobalSubTrackWidth,
  setGlobalSubFullTrackWidth
} from './globalTrackWidth';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const SliderThumb = React.memo(({
  label,
  value,
  minValue = 0,
  maxValue = 1,
  valueFormatter,
  disabled,
  centerValue,
  isAuto,
  hideValueInAuto: _hideValueInAuto,
  autoValueText: _autoValueText,
  onReset,
  onToggleAuto,
  hideAutoPlaceholder,
  sliderTrackWidth,
  sliderColor,
  parameterId,
  isMainSlider,
}: ParameterThumbViewProps) => {
  React.useEffect(() => {
    logger.debug('SliderThumb', `Mounted for param with minValue=${minValue}, maxValue=${maxValue}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [resumeKey, setResumeKey] = React.useState(0);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Increment key to force remount on resume, ensuring track width onLayout is recalculated
        setResumeKey(prev => prev + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  const internalTrackWidth = useSharedValue(
    isMainSlider 
      ? globalMainTrackWidth 
      : (hideAutoPlaceholder ? globalSubTrackWidth : globalSubFullTrackWidth)
  );
  const trackWidth = sliderTrackWidth || internalTrackWidth;

  const animatedTextProps = useAnimatedProps((): Record<string, unknown> => {
    if (!value) return { text: '' };
    const val = valueFormatter ? valueFormatter(value.value) : Math.round(value.value).toString();
    return {
      text: val,
      defaultValue: val,
    };
  });

  const animatedFillStyle = useAnimatedStyle(() => {
    if (!value || trackWidth.value === 0) return { width: 0, left: 6, opacity: 0 };
    const totalTravel = trackWidth.value - 12;
    const percentage = interpolate(
      value.value,
      [minValue, maxValue],
      [0, 1],
      Extrapolation.CLAMP
    );

    if (centerValue !== undefined) {
      const centerPercent = interpolate(
        centerValue,
        [minValue, maxValue],
        [0, 1],
        Extrapolation.CLAMP
      );

      if (percentage >= centerPercent) {
        return {
          left: 6 + centerPercent * totalTravel,
          width: (percentage - centerPercent) * totalTravel,
        };
      } else {
        return {
          left: 6 + percentage * totalTravel,
          width: (centerPercent - percentage) * totalTravel,
        };
      }
    }

    return {
      left: 6,
      width: percentage * totalTravel,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    if (!value || trackWidth.value === 0) return { transform: [{ translateX: 0 }], opacity: 0 };
    const percentage = interpolate(
      value.value,
      [minValue, maxValue],
      [0, 1],
      Extrapolation.CLAMP
    );
    const opacity = (isAuto && isAuto.value) ? 0.4 : 1;
    
    if (sliderColor) {
      return {
        transform: [{ translateX: percentage * (trackWidth.value - 12) }],
        opacity,
        borderWidth: 0,
        backgroundColor: sliderColor,
      };
    }
    
    return {
      transform: [{ translateX: percentage * (trackWidth.value - 12) }],
      opacity,
      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: '#FFF',
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return { color: '#555' };
    }
    return { color: '#FFF' };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return { backgroundColor: 'rgba(255, 255, 255, 0.05)' };
    }
    if (isAuto && isAuto.value) {
      return { backgroundColor: 'rgba(255, 255, 255, 0.08)' };
    }
    return { backgroundColor: 'rgba(255, 255, 255, 0.15)' };
  });

  const animatedFillBgStyle = useAnimatedStyle(() => {
    if (disabled && disabled.value) {
      return { backgroundColor: '#444' };
    }
    if (isAuto && isAuto.value) {
      return { backgroundColor: sliderColor ? `${sliderColor}4D` : 'rgba(255, 255, 255, 0.3)' };
    }
    return { backgroundColor: sliderColor ? sliderColor : '#FFF' };
  });

  return (
    <View key={resumeKey} style={[styles.container, hideAutoPlaceholder && { paddingHorizontal: 8 }]}>
      {isAuto && (onReset || onToggleAuto) ? (
        <AutoButton
          isActive={isAuto}
          onPress={() => {
            const active = isAuto.value;
            if (active) {
              if (onToggleAuto) {
                onToggleAuto(false);
              } else {
                isAuto.value = false;
              }
            } else {
              if (onToggleAuto) {
                onToggleAuto(true);
              } else if (onReset) {
                onReset();
              }
            }
          }}
          style={styles.autoPressable}
        />
      ) : hideAutoPlaceholder ? null : (
        <View style={styles.autoPlaceholder} />
      )}

      <View
        style={styles.trackContainer}
        onLayout={(e) => {
          if (e.nativeEvent.layout.width > 0) {
            trackWidth.value = e.nativeEvent.layout.width;
            if (isMainSlider) {
              setGlobalMainTrackWidth(e.nativeEvent.layout.width);
            } else if (hideAutoPlaceholder) {
              setGlobalSubTrackWidth(e.nativeEvent.layout.width);
            } else {
              setGlobalSubFullTrackWidth(e.nativeEvent.layout.width);
            }
          }
        }}
      >
        <Animated.View style={[styles.trackBackground, animatedTrackStyle]} />
        <Animated.View 
          key={`fill-${parameterId ?? label}`}
          style={[styles.trackFill, animatedFillStyle, animatedFillBgStyle]} 
        />
        <Animated.View 
          key={`thumb-${parameterId ?? label}`}
          style={[styles.thumb, animatedThumbStyle]} 
        />
      </View>

      <Animated.View style={styles.valueTextContainer}>
        <AnimatedTextInput
          style={[styles.valueText, animatedTextStyle]}
          animatedProps={animatedTextProps}
          editable={false}
          pointerEvents="none"
        />
      </Animated.View>
    </View>
  );
});


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    height: 32,
  },
  trackContainer: {
    flex: 1,
    height: 30, // Touch-sensitive area for dragging
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  trackFill: {
    position: 'absolute',
    left: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
  valueTextContainer: {
    width: 54, // Fixed width to accommodate long strings like "10000K" or "AWB" without clipping
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  autoPressable: {
    width: 54,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  autoPlaceholder: {
    width: 54,
    marginRight: 16,
  },
});

SliderThumb.displayName = 'SliderThumb';

