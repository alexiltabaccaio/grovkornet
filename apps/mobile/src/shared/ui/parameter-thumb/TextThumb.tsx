import React, { memo } from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const StaticTextThumb = memo(({
  value,
  valueFormatter,
  isAuto,
  staticText,
  hideValueInAuto = false,
  autoValueText = 'AUTO',
  disabled,
}: ParameterThumbViewProps) => {
  const isDisabled = disabled && disabled.value;

  const getStaticText = () => {
    if (staticText) return staticText;
    if (!value) return '';
    const autoActive = isAuto && isAuto.value;
    if (autoActive && hideValueInAuto) {
      return autoValueText;
    }
    const val = value.value;
    return valueFormatter ? valueFormatter(val) : Math.round(val).toString();
  };

  const text = getStaticText();

  return (
    <View
      style={[
        styles.pillButton,
        isDisabled ? {
          borderColor: '#222',
          backgroundColor: 'rgba(255,255,255,0.01)',
        } : {
          borderColor: '#333',
          backgroundColor: 'rgba(255,255,255,0.04)',
        }
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.pillValueText,
          { color: isDisabled ? '#666' : '#888' }
        ]}
      >
        {text}
      </Text>
    </View>
  );
});

StaticTextThumb.displayName = 'StaticTextThumb';

const AnimatedTextThumb = memo(({
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

    const val = value.value;
    const textVal = valueFormatter ? valueFormatter(val) : Math.round(val).toString();
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
    return {
      text: textVal,
      defaultValue: textVal,
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
          allowFontScaling={false}
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
          allowFontScaling={false}
          style={[
            styles.pillValueText,
            { color: isActive ? "#FFF" : "#888" }
          ]}
        >
          {staticText}
        </Text>
      </View>
    );
  }

  return null;
});

AnimatedTextThumb.displayName = 'AnimatedTextThumb';

export const TextThumb = memo((props: ParameterThumbViewProps) => {
  const { isActive, isToggle, value } = props;
  const isHighlighted = isToggle && value ? (value.value === 1) : isActive;

  if (!isHighlighted) {
    return <StaticTextThumb {...props} />;
  }

  return <AnimatedTextThumb {...props} />;
});

TextThumb.displayName = 'TextThumb';
