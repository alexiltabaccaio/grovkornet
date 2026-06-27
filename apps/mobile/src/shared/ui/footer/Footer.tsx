import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FooterProps {
  children: React.ReactNode;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const Footer = ({ children, style }: FooterProps) => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom ?? 0;

  return (
    <Animated.View style={[
      styles.footerWrapper, 
      { 
        height: 80 + bottomInset, 
        paddingBottom: bottomInset 
      }, 
      style
    ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  footerWrapper: {
    height: 80,
    // NOTE: Solid background. Only the sliding ControlPanel has the frosted glass effect.
    backgroundColor: '#0e0e0e',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
