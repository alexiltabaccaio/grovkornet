import React from 'react';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { unwrap } from '../../lib/colorMath';

interface ColorRangeTrackProps {
  trackWidth: SharedValue<number>;
  leftShared: SharedValue<number>;
  rightShared: SharedValue<number>;
  limitLeftShared: SharedValue<number>;
  limitRightShared: SharedValue<number>;
  prevColorHex: string;
  activeColorHex: string;
  nextColorHex: string;
}

const ColorRangeTrackComponent = ({
  trackWidth,
  leftShared,
  rightShared,
  limitLeftShared,
  limitRightShared,
  prevColorHex,
  activeColorHex,
  nextColorHex,
}: ColorRangeTrackProps) => {
  const leftBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedLeft = unwrap(leftShared.value, ref);
      widthVal = ((unwrappedLeft - ref) / range) * (trackWidth.value - 12);
    }
    
    return {
      left: 6,
      width: Math.max(widthVal, 0),
    };
  });

  const centerBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let leftVal = 0;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedLeft = unwrap(leftShared.value, ref);
      const unwrappedRight = unwrap(rightShared.value, ref);
      leftVal = ((unwrappedLeft - ref) / range) * (trackWidth.value - 12);
      widthVal = ((unwrappedRight - unwrappedLeft) / range) * (trackWidth.value - 12);
    }
    
    return {
      left: 6 + leftVal,
      width: Math.max(widthVal, 0),
    };
  });

  const rightBgStyle = useAnimatedStyle(() => {
    const ref = limitLeftShared.value;
    const maxA = unwrap(limitRightShared.value, ref);
    const range = maxA - ref;
    let leftVal = 0;
    let widthVal = 0;
    
    if (range > 0 && trackWidth.value > 0) {
      const unwrappedRight = unwrap(rightShared.value, ref);
      leftVal = ((unwrappedRight - ref) / range) * (trackWidth.value - 12);
      widthVal = (trackWidth.value - 12) - leftVal;
    }
    
    return {
      left: 6 + leftVal,
      width: Math.max(widthVal, 0),
    };
  });

  return (
    <>
      <Animated.View style={[styles.trackBgSection, leftBgStyle, { backgroundColor: prevColorHex }]} />
      <Animated.View style={[styles.trackBgSection, centerBgStyle, { backgroundColor: activeColorHex }]} />
      <Animated.View style={[styles.trackBgSection, rightBgStyle, { backgroundColor: nextColorHex }]} />
    </>
  );
};

const styles = StyleSheet.create({
  trackBgSection: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
  },
});

export const ColorRangeTrack = React.memo(ColorRangeTrackComponent);
