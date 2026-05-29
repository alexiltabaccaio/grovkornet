import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '@entities/system';
import { Sections } from './Sections';
import { Modules } from './Modules';
import { Parameters } from './Parameters';
import { ParameterDetailPanels } from './ParameterDetailPanels';
import { useControlPanelGestures } from '../lib/useControlPanelGestures';

import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ControlPanelProps {
  translateY?: Animated.SharedValue<number>;
  drawerAnimation?: Animated.SharedValue<number>;
  galleryTransition?: Animated.SharedValue<number>;
}

export const ControlPanel = React.memo(({ translateY: externalTranslateY, drawerAnimation: externalDrawerAnimation, galleryTransition }: ControlPanelProps) => {
  const { isDebugEnabled } = useSystemStore(useShallow(state => ({
    isDebugEnabled: state.isDebugEnabled,
  })));

  const {
    translateY,
    drawerAnimation,
    panGesture,
    activeSection,
  } = useControlPanelGestures({
    externalTranslateY,
    externalDrawerAnimation,
  });

  const debugTextProps = useAnimatedProps(() => {
    return {
      text: `Y: ${Math.round(translateY.value)}px`,
      defaultValue: `Y: 0px`,
    };
  });

  const animatedTopFooterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + drawerAnimation.value }],
    };
  });

  const isSheetVisible = activeSection !== 'none';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.topFooterContainer, animatedTopFooterStyle]} pointerEvents={isSheetVisible ? "box-none" : "none"}>
        <GestureDetector gesture={panGesture}>
          <View>
            <View style={styles.topFooter}>
              <Modules />
              <Parameters />
            </View>
            {isDebugEnabled && (
              <View style={styles.debugContainer} pointerEvents="none">
                <AnimatedTextInput
                  style={styles.debugText}
                  animatedProps={debugTextProps}
                  editable={false}
                />
              </View>
            )}
            {/* Expanded area that fills the gap underneath when pulled up */}
            <View style={styles.expandedBackground}>
              <ParameterDetailPanels translateY={translateY} />
            </View>
          </View>
        </GestureDetector>
      </Animated.View>

      <Sections galleryTransition={galleryTransition} />
    </View>
  );
});

ControlPanel.displayName = 'ControlPanel';
// (ControlPanel as React.NamedExoticComponent<ControlPanelProps> & { whyDidYouRender?: boolean }).whyDidYouRender = true;



const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: 'transparent',
    zIndex: 100,
  },

  topFooterContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -323, // Mathematically calculated to align perfectly with the red sections
    zIndex: 5,
    elevation: 5,
    backgroundColor: 'rgba(18, 18, 18, 0.75)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },

  topFooter: {
    paddingTop: 0,
    height: 147,
  },


  expandedBackground: {
    height: 400, // Ample height to cover the gap
  },





  debugContainer: {
    position: 'absolute',
    top: -30,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
