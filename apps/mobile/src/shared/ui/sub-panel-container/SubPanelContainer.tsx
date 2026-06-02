import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSystemStore } from '@entities/system';

interface SubPanelContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
}

export const SubPanelContainer = ({ children, style, showBorder = false }: SubPanelContainerProps) => {
  const isDebugEnabled = useSystemStore(state => state.isDebugEnabled);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        isDebugEnabled && styles.debugPadding,
        isDebugEnabled && showBorder && styles.debugBorder,
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
