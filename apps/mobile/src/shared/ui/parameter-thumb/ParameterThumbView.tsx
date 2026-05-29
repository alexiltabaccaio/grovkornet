import React, { forwardRef, memo } from 'react';
import { View, Text, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';
import { TextThumb } from './TextThumb';
import { ImageThumb } from './ImageThumb';


import { SliderThumb } from './SliderThumb';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultMonoscope = require('../../../../assets/monoscope.jpg') as ImageSourcePropType;

const ParameterThumbViewBase = forwardRef<View, ParameterThumbViewProps>((props, ref) => {
  const {
    label,
    isActive,
    variant = 'text',
    imageSource,
    isDebugEnabled = false,
    value,
    staticText,
    icon,
    onPress,
    renderValue,
    isToggle,
  } = props;

  const hasValue = !!value || !!staticText || !!imageSource || !!icon;
  const isMainParameter = !renderValue && variant !== 'slider' && !isToggle;

  if (variant === 'preset') {
    return (
      <Animated.View
        ref={ref}
        {...({ onPress } as Record<string, unknown>)}
        style={[
          styles.presetContainer,
          isActive && styles.presetContainerActive,
        ]}
      >
        <View style={[styles.presetImageContainer, isActive && styles.presetImageContainerActive]}>
          <Image
            source={imageSource || defaultMonoscope}
            style={[styles.presetImage, !isActive && { opacity: 0.7 }]}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        </View>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={[
            styles.presetLabel,
            isActive && styles.presetLabelActive,
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </Animated.View>
    );
  }

  if (variant === 'text' && !hasValue) {
    return (
      <Animated.View
        ref={ref}
        {...({ onPress } as Record<string, unknown>)}
        style={[
          styles.filterThumb,
          isMainParameter && { flex: 1 },
          { justifyContent: 'center', height: 82 },
          isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
        ]}
      >
        <Text 
          allowFontScaling={false}
          style={[
            styles.filterText,
            isActive && styles.filterTextActive,
            { fontSize: 13, fontWeight: '800', textAlign: 'center', minHeight: undefined }
          ]}
        >
          {label.toUpperCase().split(' ').join('\n')}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      ref={ref}
      {...({ onPress } as Record<string, unknown>)}
      style={[
        styles.filterThumb,
        isMainParameter && { flex: 1 },
        variant === 'slider' && { width: '100%', alignItems: 'center' },
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderColor: 'green' }
      ]}
    >
      {!!label && (
        <Text 
          allowFontScaling={false}
          style={[
            styles.filterText,
            isActive && styles.filterTextActive,
            !isActive && !!imageSource && { opacity: 0.3 },
            { marginBottom: 6, minHeight: undefined },
            variant === 'text' && { fontSize: 13, fontWeight: '800', marginBottom: 4 }
          ]}
        >
          {label.toUpperCase().split(' ').join('\n')}
        </Text>
      )}
      <View style={[
        styles.filterPlaceholder,
        { marginBottom: 0 },
        !!imageSource && { height: 32 },
        !!imageSource && !!label && { marginTop: 8, marginBottom: 14 },
        variant === 'text' && !imageSource && styles.textVariantPlaceholder,
        variant === 'text' && !imageSource && { width: 'auto', height: 'auto' },
        variant === 'slider' && { width: '100%', height: 'auto', backgroundColor: 'transparent', borderWidth: 0, overflow: 'visible' },
        isDebugEnabled && variant === 'text' && { backgroundColor: 'rgba(255,0,0,0.2)', borderColor: 'red' }
      ]}>
        {variant === 'text' && !imageSource && <TextThumb {...props} />}
        {variant === 'slider' && <SliderThumb {...props} />}
        {!!imageSource && <ImageThumb {...props} />}
      </View>
    </Animated.View>
  );
});

ParameterThumbViewBase.displayName = 'ParameterThumbView';

const arePropsEqual = (prev: ParameterThumbViewProps, next: ParameterThumbViewProps): boolean => {
  const prevImg = prev.imageSource;
  const nextImg = next.imageSource;

  let isImageEqual = false;
  if (prevImg === nextImg) {
    isImageEqual = true;
  } else if (
    prevImg &&
    nextImg &&
    typeof prevImg === 'object' &&
    typeof nextImg === 'object' &&
    'uri' in prevImg &&
    'uri' in nextImg
  ) {
    isImageEqual = (prevImg as { uri?: string }).uri === (nextImg as { uri?: string }).uri;
  }

  const areCallbacksEqual = 
    prev.onPress === next.onPress && 
    prev.onReset === next.onReset && 
    prev.onToggleAuto === next.onToggleAuto;

  return !!(
    prev.label === next.label &&
    prev.isActive === next.isActive &&
    prev.variant === next.variant &&
    prev.isDebugEnabled === next.isDebugEnabled &&
    prev.staticText === next.staticText &&
    prev.renderValue === next.renderValue &&
    prev.isToggle === next.isToggle &&
    prev.hideValueInAuto === next.hideValueInAuto &&
    prev.autoValueText === next.autoValueText &&
    prev.minValue === next.minValue &&
    prev.maxValue === next.maxValue &&
    prev.centerValue === next.centerValue &&
    prev.sliderColor === next.sliderColor &&
    prev.value === next.value &&
    prev.isAuto === next.isAuto &&
    prev.disabled === next.disabled &&
    prev.sliderTrackWidth === next.sliderTrackWidth &&
    prev.valueFormatter === next.valueFormatter &&
    prev.icon === next.icon &&
    prev.hideAutoPlaceholder === next.hideAutoPlaceholder &&
    isImageEqual &&
    areCallbacksEqual
  );
};

export const ParameterThumbView = memo(ParameterThumbViewBase, arePropsEqual);


