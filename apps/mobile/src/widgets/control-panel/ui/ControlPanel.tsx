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
import { BlurView } from 'expo-blur';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface ControlPanelProps {
  translateY?: Animated.SharedValue<number>;
  drawerAnimation?: Animated.SharedValue<number>;
  galleryTransition?: Animated.SharedValue<number>;
}

export const ControlPanel = ({ translateY: externalTranslateY, drawerAnimation: externalDrawerAnimation, galleryTransition }: ControlPanelProps) => {
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

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + drawerAnimation.value }],
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
      <BlurView intensity={80} tint="dark" style={[styles.unifiedBackgroundBase, styles.unifiedBackgroundClosed]} pointerEvents="none" />
      <AnimatedBlurView
        intensity={80}
        tint="dark"
        style={[
          styles.unifiedBackgroundBase,
          styles.unifiedBackgroundOpen,
          animatedBackgroundStyle
        ]}
        pointerEvents="none"
      />
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
            {/* Area espansa che riempie il vuoto sotto quando si tira su */}
            <View style={styles.expandedBackground}>
              <ParameterDetailPanels translateY={translateY} />
            </View>
          </View>
        </GestureDetector>
      </Animated.View>

      <Sections galleryTransition={galleryTransition} />
    </View>
  );
};

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
  unifiedBackgroundBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  unifiedBackgroundClosed: {
    bottom: -1000,
    height: 1000,
  },
  unifiedBackgroundOpen: {
    bottom: -1000,
    height: 1220,
  },

  topFooterContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -323, // Calcolato matematicamente per combaciare perfettamente con le sezioni rosse
    zIndex: 5,
    elevation: 5,
  },

  topFooter: {
    paddingTop: 0,
    height: 147,
  },


  expandedBackground: {
    height: 400, // Altezza abbondante per coprire il buco
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
