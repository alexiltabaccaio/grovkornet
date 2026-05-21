import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useUIStore } from '@features/camera-controls/model/useUIStore';

interface ParameterExtensionWrapperProps {
  animatedStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  gap?: number;
  paddingHorizontal?: number;
}

export const ParameterExtensionWrapper = ({
  animatedStyle,
  children,
  gap = 12,
  paddingHorizontal = 24,
}: ParameterExtensionWrapperProps) => {
  const isDebugEnabled = useUIStore(state => state.isDebugEnabled);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.parameterExtensionContainer, animatedStyle]}>
        <View
          style={[
            styles.debugWrapper,
            isDebugEnabled && {
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              borderColor: 'green',
            },
          ]}
        >
          <View style={[styles.buttonRow, { gap, paddingHorizontal }]}>
            {children}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  parameterExtensionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
  },
  debugWrapper: {
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
