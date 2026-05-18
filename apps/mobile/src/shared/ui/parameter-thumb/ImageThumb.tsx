import React from 'react';
import { Image } from 'react-native';
import { ParameterThumbViewProps } from './ParameterThumbView.types';
import { styles } from './ParameterThumbView.styles';

export const ImageThumb = ({
  isActive,
  imageSource,
}: ParameterThumbViewProps) => {
  if (!imageSource) return null;

  return (
    <Image
      source={imageSource}
      style={[styles.imageSource, !isActive && { opacity: 0.3 }]}
      resizeMode="cover"
    />
  );
};
