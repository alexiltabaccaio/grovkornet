import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface BottomFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const BottomFooter = ({ children, style }: BottomFooterProps) => {
  return (
    <View style={[styles.bottomFooterWrapper, style]}>
      {children}
    </View>
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
