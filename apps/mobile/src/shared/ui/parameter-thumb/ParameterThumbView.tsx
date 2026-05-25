import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';
import { TextThumb } from './TextThumb';
import { ImageThumb } from './ImageThumb';


import { SliderThumb } from './SliderThumb';

export const ParameterThumbView = forwardRef<View, ParameterThumbViewProps>((props, ref) => {
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

ParameterThumbView.displayName = 'ParameterThumbView';
// @ts-expect-error - whyDidYouRender is a property dynamically read by why-did-you-render in development
ParameterThumbView.whyDidYouRender = true;

