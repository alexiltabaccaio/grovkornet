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
    backgroundColor: '#0e0e0e',
    borderTopWidth: 1,
    borderTopColor: '#222',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
