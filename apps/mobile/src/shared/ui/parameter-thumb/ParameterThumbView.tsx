import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';
import { SquareThumb } from './SquareThumb';
import { TextThumb } from './TextThumb';
import { ImageThumb } from './ImageThumb';
import { AutoBadge } from './AutoBadge';

export const ParameterThumbView = forwardRef<View, ParameterThumbViewProps>((props, ref) => {
  const {
    label,
    isActive,
    variant = 'square',
    imageSource,
    isDebugEnabled = false,
  } = props;

  return (
    <Animated.View
      ref={ref}
      style={[
        styles.filterThumb,
        isDebugEnabled && { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: 'green' }
      ]}
    >
      <View style={[
        styles.filterPlaceholder,
        !!imageSource && { height: 32, marginTop: 8, marginBottom: 14 },
        variant === 'square' && isActive && styles.filterPlaceholderActive,
        variant === 'square' && styles.iconPlaceholder,
        variant === 'text' && styles.textVariantPlaceholder,
        isDebugEnabled && variant === 'text' && { backgroundColor: 'rgba(255,0,0,0.2)', borderWidth: 1, borderColor: 'red' }
      ]}>
        {variant === 'square' && !imageSource && <SquareThumb {...props} />}
        {variant === 'text' && !imageSource && <TextThumb {...props} />}
        {!!imageSource && <ImageThumb {...props} />}

        <AutoBadge {...props} />

        {variant === 'square' && !imageSource && (
          <View style={[styles.borderOverlay, isActive && styles.borderOverlayActive]} pointerEvents="none" />
        )}
      </View>
      <Text style={[
        styles.filterText, 
        isActive && styles.filterTextActive,
        !isActive && !!imageSource && { opacity: 0.3 }
      ]}>
        {label.toUpperCase().split(' ').join('\n')}
      </Text>
    </Animated.View>
  );
});

ParameterThumbView.displayName = 'ParameterThumbView';
