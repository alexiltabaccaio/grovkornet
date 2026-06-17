import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomFooterProps {
  children: React.ReactNode;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const BottomFooter = ({ children, style }: BottomFooterProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[
      styles.bottomFooterWrapper, 
      { 
        height: 80 + insets.bottom, 
        paddingBottom: insets.bottom 
      }, 
      style
    ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomFooterWrapper: {
    height: 80,
    // NOTE: Solid background. Only the sliding ControlPanel has the frosted glass effect.
    backgroundColor: '#0e0e0e',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
