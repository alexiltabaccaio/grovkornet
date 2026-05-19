import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';
import { SquareThumb } from './SquareThumb';
import { TextThumb } from './TextThumb';
import { ImageThumb } from './ImageThumb';
import { AutoBadge } from './AutoBadge';

import { SliderThumb } from './SliderThumb';

export const ParameterThumbView = forwardRef<View, ParameterThumbViewProps>((props, ref) => {
  const {
    label,
    isActive,
    variant = 'square',
    imageSource,
    isDebugEnabled = false,
    value,
    staticText,
    icon,
  } = props;

  const hasValue = !!value || !!staticText || !!imageSource || !!icon;

  if (variant === 'text' && !hasValue) {
    return (
      <Animated.View
        ref={ref}
        style={[
          styles.filterThumb,
          { justifyContent: 'center', height: 48 },
          isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
        ]}
      >
        <Text style={[
          styles.filterText, 
          isActive && styles.filterTextActive,
          { fontSize: 13, fontWeight: '800', textAlign: 'center', minHeight: undefined }
        ]}>
          {label.toUpperCase().split(' ').join('\n')}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      ref={ref}
      style={[
        styles.filterThumb,
        variant === 'slider' && { width: '100%', alignItems: 'center' },
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}
    >
      {!!label && (
        <Text style={[
          styles.filterText, 
          isActive && styles.filterTextActive,
          !isActive && !!imageSource && { opacity: 0.3 },
          { marginBottom: 6, minHeight: undefined },
          variant === 'text' && { fontSize: 13, fontWeight: '800', marginBottom: 8 }
        ]}>
          {label.toUpperCase().split(' ').join('\n')}
        </Text>
      )}
      <View style={[
        styles.filterPlaceholder,
        { marginBottom: 0 },
        !!imageSource && { height: 32, marginTop: 8, marginBottom: 14 },
        variant === 'square' && isActive && styles.filterPlaceholderActive,
        variant === 'square' && styles.iconPlaceholder,
        variant === 'text' && styles.textVariantPlaceholder,
        variant === 'text' && { width: 'auto', height: 'auto' },
        variant === 'slider' && { width: '100%', height: 'auto', backgroundColor: 'transparent', borderWidth: 0, overflow: 'visible' },
        isDebugEnabled && variant === 'text' && { backgroundColor: 'rgba(255,0,0,0.2)', borderWidth: 1, borderColor: 'red' }
      ]}>
        {variant === 'square' && !imageSource && <SquareThumb {...props} />}
        {variant === 'text' && !imageSource && <TextThumb {...props} />}
        {variant === 'slider' && <SliderThumb {...props} />}
        {!!imageSource && <ImageThumb {...props} />}

        {variant !== 'slider' && <AutoBadge {...props} />}

        {variant === 'square' && !imageSource && (
          <View style={[styles.borderOverlay, isActive && styles.borderOverlayActive]} pointerEvents="none" />
        )}
      </View>
    </Animated.View>
  );
});

ParameterThumbView.displayName = 'ParameterThumbView';
