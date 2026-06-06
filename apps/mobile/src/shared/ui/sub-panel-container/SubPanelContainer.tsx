import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface SubPanelContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
  isLayoutOverlayEnabled?: boolean;
}

export const SubPanelContainer = ({ children, style, showBorder = false, isLayoutOverlayEnabled = false }: SubPanelContainerProps) => {
  return (
    <Animated.View
      style={[
        styles.container,
        style,
        isLayoutOverlayEnabled && styles.debugPadding,
        isLayoutOverlayEnabled && showBorder && styles.debugBorder,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  debugPadding: {
    paddingTop: 6,
  },
  debugBorder: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderColor: 'green',
    borderWidth: 1,
    margin: -1.5,
  },
});
