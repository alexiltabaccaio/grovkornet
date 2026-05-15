import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../model/useUIStore';
import { FooterSections } from './FooterSections';
import { FooterModules } from './FooterModules';
import { FooterPrimaryParameters } from './FooterPrimaryParameters';
import { BottomSheetHandle } from './BottomSheetHandle';
import { SubParameterPanel } from './SubParameterPanel';

import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);


export const Footer = () => {
  const { activeSection, isDebugEnabled } = useUIStore(useShallow(state => ({
    activeSection: state.activeSection,
    isDebugEnabled: state.isDebugEnabled,
  })));


  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const MAX_UP = -250; // Massima altezza (aperto)
  const MAGNETIC_THRESHOLD = 50; // Quanti pixel dal bordo per far scattare il magnete

  const panGesture = Gesture.Pan()
    .activeOffsetY([-5, 5]) // Evita conflitti con scroll orizzontali
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      let newY = startY.value + e.translationY;
      // Clamp tra aperto e chiuso
      if (newY < MAX_UP) newY = MAX_UP;
      if (newY > 0) newY = 0;
      translateY.value = newY;
    })
    .onEnd((e) => {
      let targetY = translateY.value;

      if (translateY.value > -MAGNETIC_THRESHOLD) {
        // Se vicino alla base, scatta a 0 (Chiuso)
        targetY = 0;
      } else if (translateY.value < MAX_UP + MAGNETIC_THRESHOLD) {
        // Se vicino alla cima, scatta a MAX_UP (Aperto)
        targetY = MAX_UP;
      } else {
        // Drag libero al centro, con inerzia
        targetY = translateY.value + e.velocityY * 0.1;
        // Clamp di sicurezza
        if (targetY < MAX_UP + MAGNETIC_THRESHOLD) targetY = MAX_UP;
        if (targetY > -MAGNETIC_THRESHOLD) targetY = 0;
      }

      translateY.value = withSpring(targetY, {
        damping: 20,
        stiffness: 200,
        mass: 1,
      });
    });

  const debugTextProps = useAnimatedProps(() => {
    return {
      text: `Y: ${Math.round(translateY.value)}px`,
      defaultValue: `Y: 0px`,
    } as any;
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });


  const animatedTopFooterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.unifiedBackground, animatedBackgroundStyle]} pointerEvents="none" />
      <Animated.View style={[styles.topFooterContainer, animatedTopFooterStyle]} pointerEvents="box-none">

        {activeSection !== 'none' && (
          <GestureDetector gesture={panGesture}>
            <View>
              <View style={styles.topFooter}>
                <View style={styles.handleWrapper} hitSlop={{ top: 20, bottom: 20, left: 100, right: 100 }}>
                  <BottomSheetHandle />
                </View>
                <FooterModules />
                <FooterPrimaryParameters />
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
                <SubParameterPanel translateY={translateY} />
              </View>


            </View>
          </GestureDetector>
        )}
      </Animated.View>

      <FooterSections />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  unifiedBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1000,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },

  topFooterContainer: {
    width: '100%',
    position: 'absolute',
    bottom: -400,
  },

  topFooter: {
    paddingTop: 10,
    height: 120,
    justifyContent: 'flex-end',
  },

  handleWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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

