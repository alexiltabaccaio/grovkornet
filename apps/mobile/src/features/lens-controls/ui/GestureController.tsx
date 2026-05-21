import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSystemStore } from '@entities/system';
import { useShallow } from 'zustand/react/shallow';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.3;

/**
 * GestureController handles global vertical swipe gestures to update the active camera parameter.
 * It is now generic and follows the Open-Closed Principle by consuming a GestureConfig 
 * provided by the active ParameterControl.
 */
interface GestureControllerProps {
  children?: ReactNode;
}

export const GestureController = ({ children }: GestureControllerProps) => {
  const { activeSection, setActiveSection } = useSystemStore(useShallow((s) => ({
    activeSection: s.activeSection,
    setActiveSection: s.setActiveSection,
  })));
  const startVal = useSharedValue(0);

  const composedGesture = useMemo(() => {
    const tap = Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => {
        if (activeSection !== 'none') {
          setActiveSection('none');
        }
      });

    return tap;
  }, [activeSection, setActiveSection]);

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container} pointerEvents="auto">
        {children}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
});
