import React from 'react';
import Animated from 'react-native-reanimated';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface ColorRangeThumbProps {
  style: StyleProp<ViewStyle>;
  activeColorHex: string;
}

export const ColorRangeThumb = ({ style, activeColorHex }: ColorRangeThumbProps) => {
  return (
    <Animated.View style={[styles.thumb, style, { borderColor: activeColorHex }]} />
  );
};

const styles = StyleSheet.create({
  thumb: {
    position: 'absolute',
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
});
